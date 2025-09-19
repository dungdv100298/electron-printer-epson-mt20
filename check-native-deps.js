#!/usr/bin/env node

/**
 * Script to check for native dependencies that require build tools
 */

const fs = require('fs');
const path = require('path');

// Dependencies that require native build tools
const NATIVE_DEPS = [
  'canvas',
  'sharp',
  'node-gyp',
  'node-sass',
  'sass',
  'puppeteer',
  'playwright',
  'sqlite3',
  'bcrypt',
  'node-ffi',
  'ref',
  'ffi-napi',
  'ref-napi',
  'node-pty',
  'pty.js',
  'serialport',
  'usb',
  'node-hid',
  'node-bluetooth',
  'bluetooth-hci-socket',
  'noble',
  'noble-mac',
  'noble-winrt',
  'bluetooth-serial-port'
];

// Check package.json for native dependencies
function checkPackageJson() {
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  const foundNative = [];
  
  for (const [dep, version] of Object.entries(allDeps)) {
    if (NATIVE_DEPS.includes(dep)) {
      foundNative.push({ name: dep, version, type: 'native' });
    }
  }
  
  return foundNative;
}

// Check for native dependencies
console.log('🔍 Checking for native dependencies...\n');

const nativeDeps = checkPackageJson();

if (nativeDeps.length === 0) {
  console.log('✅ No native dependencies found!');
  console.log('✅ No build tools required!');
  console.log('✅ Pure JavaScript project!');
} else {
  console.log('❌ Found native dependencies that require build tools:');
  nativeDeps.forEach(dep => {
    console.log(`   - ${dep.name}@${dep.version}`);
  });
  console.log('\n⚠️  These dependencies require:');
  console.log('   - Visual Studio Build Tools');
  console.log('   - Python 3.x');
  console.log('   - Windows SDK');
  console.log('   - node-gyp compilation');
}

console.log('\n📋 Current dependencies:');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
console.log('Dependencies:', Object.keys(packageJson.dependencies || {}).length);
console.log('DevDependencies:', Object.keys(packageJson.devDependencies || {}).length);
