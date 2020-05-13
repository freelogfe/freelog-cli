const {aliyuncsPagebuildUrl} = require('../config');

const axios = require('axios');
const fs = require('fs');

const main = async () => {

    const {data: templateString} = await axios.get(aliyuncsPagebuildUrl);

    const html = templateString
      .replace(/(?<=<div id="js-page-container">)[\s\S]*?(?=<\/div>)/, `<%= require('html-loader!./them-template.html') %>`)
      .replace('{{authInfoFragment | safe}}', `<%= require('html-loader!./__auth_info__.html') %>`)
    ;

    if (!fs.existsSync('public') || fs.statSync('public').isFile()) {
        fs.mkdirSync('public');
    }

    fs.writeFileSync('public/index.html', html, 'utf-8');

};

if (require.main === module) {
  main();
}

module.exports = main;
