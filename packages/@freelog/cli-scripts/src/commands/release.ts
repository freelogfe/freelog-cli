import {Command, flags} from '@oclif/command';
import * as fs from 'fs';
import axios from 'axios';
import * as semver from 'semver';

import {getUserInfo, getCookies} from './login';
import {serverOrigin, projectPackage, colorLog} from '../config';
import {run as uploadResource} from './upload';

export default class Hello extends Command {
  static description = 'release resource';

  static examples = [
    `$ freelog-scripts release
`,
  ];

  // static flags = {
  //   help: flags.help({char: 'h'}),
  //   // flag with a value (-n, --name=VALUE)
  //   name: flags.string({char: 'n', description: 'name to print'}),
  //   // flag with no value (-f, --force)
  //   force: flags.boolean({char: 'f'}),
  // };
  //
  // static args = [{name: 'file'}]

  async run() {
    run();
    // const {args, flags} = this.parse(Hello)
    //
    // const name = flags.name ?? 'world'
    // this.log(`hello ${name} from ./src/commands/hello.ts`)
    // if (args.file && flags.force) {
    //   this.log(`you input --force and --file: ${args.file}`)
    // }
  }
}

async function run() {
  const userInfo = await getUserInfo();

  const releaseName = userInfo.username + '/' + projectPackage.name;

  const config = {
    params: {
      releaseName,
    },
    headers: {
      'Cookie': await getCookies(),
    },
  };

  const {data} = await axios.get(serverOrigin + '/v1/releases/detail', config);
  if (data.data) {

    const publishedVersion = data.data.latestVersion.version;
    if (!semver.gt(projectPackage.version, publishedVersion)) {
      colorLog.error(`You cannot publish over the previously published version: ${publishedVersion} !`);
      colorLog.error(`Please update your 'version' field of 'package.json' !!!`);
      return null;
    }

    const result = await updateRelease(data.data);
    if (result === null) {
      return;
    }

    colorLog.success('Update release succeeded !')
  } else {
    const result = await newRelease();
    if (result === null) {
      return;
    }
    colorLog.success('Create release succeeded !')
  }

}

async function newRelease() {
  const resource = await uploadResource();

  if (resource === null) {
    return null;
  }

  const params = {
    resourceId: resource.resourceId,
    releaseName: projectPackage.name,
    version: projectPackage.version,
    baseUpcastReleases: [],
    resolveReleases: [],
  };

  const config = {
    headers: {
      'Cookie': await getCookies(),
    },
  };

  const {data} = await axios.post(serverOrigin + '/v1/releases', params, config);

  if (data.ret !== 0 || data.errcode !== 0) {
    colorLog.error(JSON.stringify(data.ret.msg, null, 2));
    return null;
  }

  return data.data;
}

async function updateRelease(release: any) {
  const resource = await uploadResource();

  if (resource === null) {
    return null;
  }

  const exitsResource = release.resourceVersions.map((i: any) => i.resourceId);
  if (exitsResource.includes(resource.resourceId)) {
    colorLog.error('The current release a version already exists for the resource !');
    colorLog.error('Cannot add duplicate !!!');
    return null;
  }

  const params = {
    resourceId: resource.resourceId,
    version: projectPackage.version,
    resolveReleases: [],
  };
  const config = {
    headers: {
      'Cookie': await getCookies(),
    },
  };

  const {data} = await axios.post(serverOrigin + `/v1/releases/${release.releaseId}/versions`, params, config);

  if (data.ret !== 0 || data.errcode !== 0) {
    colorLog.error(JSON.stringify(data.msg, null, 2));
    return null;
  }

  return data.data;
}
