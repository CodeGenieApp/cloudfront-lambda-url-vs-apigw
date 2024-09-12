import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { FaviconFile, FaviconImage, favicons } from 'favicons'
import { existsSync } from 'node:fs'

export async function generateIcons() {
  const publicPath = path.resolve(import.meta.dirname, '../ui/public')
  const logoPath = path.join(publicPath, 'logo.png')
  const iconsDirName = 'icons'
  const publicIconsPath = path.join(publicPath, iconsDirName)

  if (!existsSync(logoPath)) {
    console.info('no logo.png found at', publicPath)
    return
  }

  const faviconsResponse = await favicons(logoPath, {
    path: iconsDirName,
    // appName: null,
    // appShortName: null, // Defaults to appName
    // appDescription: null,
    // developerName: null,
    // developerURL: null,
    // theme_color: '#fff',
  })

  await mkdir(publicIconsPath, { recursive: true })

  const promises = [
    ...faviconsResponse.images.map((image: FaviconImage) => writeFile(path.join(publicIconsPath, image.name), image.contents, 'binary')),
    ...faviconsResponse.files.map((file: FaviconFile) => writeFile(path.join(publicIconsPath, file.name), file.contents, 'binary')),
    writeFile(path.join(publicIconsPath, 'index.html'), faviconsResponse.html.join('\n'), 'binary'),
    copyFile(logoPath, path.join(publicPath, 'logo.png')),
  ]

  await Promise.all(promises)
  await copyFile(path.join(publicIconsPath, 'favicon.ico'), path.join(publicPath, 'favicon.ico'))
}

generateIcons()
