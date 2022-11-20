function GET(req, res) {
    res.json({ text: 'root get' })
}

function OPTIONS(req, res) {
    res.json({ text: 'root options' })
}

function POST(req, res) {
    res.json({ text: 'root post' })
}

export { GET, OPTIONS, POST }
