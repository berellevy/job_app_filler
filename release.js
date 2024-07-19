/**
 * creates a release bundle with the current version in the name.
 * Prompts for confirmation on bundle name conflict.
 *
 * Steps:
 * - checks for existing release bundle with same name.
 * - prompts to overwrite or not.
 * - if not: exits.
 * - if yes:
 * - Removes existing dist folder.
 * - builds new dist folder.
 * - zips dist folder into releases folder with versioned name.
 */

const pkg = require('./package.json')
const mnfst = require('./src/static/manifest.json')
const fs = require('fs')
const {confirm} = require("@inquirer/prompts")
const { setTimeout } = require('timers/promises')
const { exec } = require('child_process')

const matchVersions = () => {
  if (pkg.version !== mnfst.version) {
    console.warn(
      'package.json version is not up to date with manifest.json version'
    )
  }
}

/**
 * prevent accidental release bundle overwrite
 */
const handleNameConflict = async (newReleasePath) => {
  if (fs.existsSync(newReleasePath)) {
    await setTimeout(500)
    // const confirmation = await select({
    //   message: `\nWARNING!!\n\n A release already exists at ${newReleasePath}. Do you want to overwrite it? \nThis cannot be undone!\n`,
    //   choices: [
    //     { name: 'No', value: false },
    //     { name: 'Yes (Dangerous)', value: true },
    //   ],
    // })
    const answer = await confirm(
      {
        message: 'WARNING!!\n\n A release already exists at ${newReleasePath}. Do you want to overwrite it? \nThis cannot be undone!',
        default: false,
      },
    )
    if (!answer) {
      await setTimeout(750)
      console.log(
        '\nIf you want to package a new release, change the version in src/static/manifest.json\n'
      )
      await setTimeout(750)
      process.exit(1)
    } else {
      await setTimeout(500)
    }
  }
}

/**
 * exits the process on error
 */
const execAsync = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
      }

      if (stderr) {
        console.error(`Stderr: ${stderr}`)
        process.exit(1)
      }

      console.log(stdout)
      resolve()
    })
  })
}

// MAIN
;(async () => {
  const newReleasePath = `releases/${pkg.name}-${mnfst.version}.zip`

  // confirm versions match
  matchVersions()

  // prevent accidental release file overwrite
  await handleNameConflict(newReleasePath)

  // remove dist dir
  if (fs.existsSync('dist')) {
    console.log("Removing existing 'dist' directory.\n")
    fs.rmSync('dist', { recursive: true, force: true })
  }

  // run webpack build
  console.log('\nwebpack compile\n')
  await execAsync('webpack --config webpack.prod.js')

  // zip release bundle
  console.log('\nzipping release bundle\n')
  await execAsync(`zip -r ${newReleasePath} dist -x '*/.DS_Store'`)
  console.log(`Complete. New release available at ${newReleasePath}`);

})().then(() => {
  process.exit(0)
})

