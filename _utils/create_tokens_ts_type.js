const fs = require("fs")
const path = require("path")

const tokensDir = path.join(__dirname, "../public/medias/tokens")

fs.readdir(tokensDir, (err, files) => {
  if (err) throw err

  // Extract the token names from the filenames (without extensions)
  const tokens = files.map((file) => path.basename(file, path.extname(file)))

  // Generate the TypeScript type
  const tokenType = `export type Token = ${tokens.map((token) => `"${token.toUpperCase()}"`).join(" | ")};\n`

  // Write the type to a .ts file
  fs.writeFileSync(path.join(__dirname, "tokens.ts"), tokenType)

  console.log("Token type file generated!")
})
