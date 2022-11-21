function json(data) {
    this.end(JSON.stringify(data))
}

const helpers = { json }

export default helpers
