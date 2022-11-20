import * as path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'url'
import { readdir } from 'node:fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = new Map()
const baseDir = path.join(__dirname, '/routes')

async function loadRoutesDir(dirName, base) {
    const relativePath = path.join(base, dirName)
    const workDir = path.join(baseDir, relativePath)

    const dir = await readdir(workDir, { withFileTypes: true })
    for (const dirent of dir) {
        if (dirent.isDirectory()) {
            return loadRoutesDir(dirent.name, path.join(base, dirName))
        } else if (
            dirent.isFile() &&
            path.extname(dirent.name) === '.js' &&
            path.basename(dirent.name, '.js') === 'index'
        ) {
            const modulePath = pathToFileURL(path.join(workDir, dirent.name))
            const module = await import(modulePath)
            router.set(relativePath.replaceAll(path.sep, '/'), { ...module })
        }
    }
}

await loadRoutesDir('', path.sep)

console.log(router)
export default router
