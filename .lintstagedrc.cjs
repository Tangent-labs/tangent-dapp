module.exports = {
  "*.{ts,tsx}": ["bash -c 'npm run validate'"],
  "*": "prettier --write --ignore-unknown",
}
