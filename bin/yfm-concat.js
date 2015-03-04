#!/usr/bin/env node

'use strict';

var program = require('commander');
var yfmConcat = require('..');

function toLowerCase(val) { return String.prototype.toLowerCase.apply(val); }

program
    .version('0.0.1')
    .usage('[options] <file ...>')
    .description('Concatenate the YAML front matter of several files')
    .option('-o, --output <file>', 'Save result to file', String, '-')
    .option('-f, --format <format>', 'Output format (YAML or JSON)', toLowerCase, 'yaml')
    .option('-C, --cwd <path>', 'Output with keys relative to this path', String, '')
    .option('-d, --delims <delimiter>', 'YAML delimiter', '---,---')
    .option('-i, --indent <indent>', 'Number of spaces to indent', 4)
    .option('-m, --merge', 'Merge YFM into a single object')
    .option('-e, --extend <key>', 'Put result under a key with this name')
    .parse(process.argv);

// check arguments
var err = '';
if (program.args.length < 1)
    err += 'error - please provide a files pattern\n';

if (['yaml', 'json'].indexOf(program.format) < 0)
    err += 'error - unknown format '+ program.format +'.\n';

if (err) {
    process.stderr.write(err);
    process.exit(1);
}

// delimiters
var delims = program.delims.split(',');
if (delims.length === 0) delims = ['---'];
if (delims.length === 1) delims.push(delims[0]);

var extend = false;
if (program.extend) {
    var data = {};
    extend = data[program.extend] = {};
}

// YFM!
var yfm = yfmConcat(program.args, {
    indent: program.indent,
    cwd: program.cwd,
    format: (extend) ? null : program.format,
    delims: delims,
    merge: program.merge,
    extend: extend,
});

// yfm is a JS object
if (extend)
    if (program.format == 'json') yfm = JSON.stringify(data);
    else yfm = delims[0] + '\n' + require('js-yaml').safeDump(data) + delims[1] + '\n';

if (yfm === delims[0] + '\n' + '{}\n' + delims[1] + '\n')
    yfm = delims[0] + '\n' + delims[1] + '\n';

// output
if (program.output === '-')
    process.stdout.write(yfm);

else
    require('fs').writeFile(program.output, yfm, function(err) {
        if (err) process.stderr.write(err);
        else process.stdout.write(program.output + '\n');
    });
