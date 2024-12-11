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
const mnfst = require('./src/static/manifest.json')
const path = require("path")
const os = require("os")
const fs = require('fs')
const {confirm} = require("@inquirer/prompts")
const { setTimeout } = require('timers/promises')
const { exec } = require('child_process')
const {snakeCase} = require("lodash")


/**
 * prevent accidental release bundle overwrite
 */
const handleNameConflict = async (newReleasePath) => {
  if (fs.existsSync(newReleasePath)) {
    await setTimeout(500)
    const answer = await confirm(
      {
        message: `WARNING!!\n\n A release already exists at ${newReleasePath}. Do you want to overwrite it? \nThis cannot be undone!`,
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

const getZipCommand = (newReleasePath) => {
  const platform = os.platform()

  const zipCommands = {
    win32: `powershell Compress-Archive -Path dist -DestinationPath ${newReleasePath}`,
    darwin: `zip -r ${newReleasePath} dist -x '*/.DS_Store'`,
  }
  const zipCommand = zipCommands[platform]
  if (!zipCommand) {
    throw new Error(`please add a zip command for ${platform} os.`)
  }
  return zipCommand
}


// MAIN
;(async () => {
  const newReleasePath = path.join("releases", `${snakeCase(mnfst.name)}-${mnfst.version}.zip`)
  
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
  await execAsync(getZipCommand(newReleasePath))
  console.log(`Complete. New release available at ${newReleasePath}`);

})().then(() => {
  process.exit(0)
})

