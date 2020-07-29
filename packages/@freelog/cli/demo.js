const inquirer = require('inquirer')
var choices = [];
choices.push('Multiline option \n  super cool feature');
choices.push({
  name:
    'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium.',
  value: 'foo',
  short: 'The long option'
});

inquirer
  .prompt([
    {
      type: 'list',
      name: 'letter',
      message: "What's your favorite letter?",
      choices: choices
    },
    {
      type: 'checkbox',
      name: 'name',
      message: 'Select the letter contained in your name:',
      choices: choices
    }
  ])
  .then(answers => {
    console.log(JSON.stringify(answers, null, '  '));
  });