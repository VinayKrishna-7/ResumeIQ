const { spawnSync } = require('child_process');
const path = require('path');

const testFiles = [
  'normalizer.test.js',
  'scoring.test.js',
  'deepFix.test.js',
  'integration.test.js'
];


console.log('========================================');
console.log('🧪 RUNNING RESUMEIQ TEST SUITE');
console.log('========================================');

let allPassed = true;

testFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  console.log(`\n▶ Running ${file}...`);
  const result = spawnSync('node', [filePath], { stdio: 'inherit', env: process.env });

  if (result.status !== 0) {
    console.error(`❌ Test failed: ${file}`);
    allPassed = false;
  }
});

console.log('\n========================================');
if (allPassed) {
  console.log('🎉 ALL RESUMEIQ BACKEND TESTS PASSED SUCCESSFULLY!');
  console.log('========================================');
  process.exit(0);
} else {
  console.error('💥 SOME TESTS FAILED');
  console.log('========================================');
  process.exit(1);
}
