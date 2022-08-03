const moment = require('moment')

module.exports = apacheLog = {
    checkFile: (req, resp, next) => {

        const files = req.files['log']
        if (files) {
            const file = files[0]
            const lines = Buffer.from(file.buffer).toString().split('\n')

            if (lines) {
                let fields = req.body.fields

                if (!fields) {
                    fields = ['date_time', 'request', 'status_code']
                }
                console.log('Total lines: ' +lines.length)
                req.fields = fields
                req.data = [fields]
                req.lines = lines

                next()
            } else {
                resp.status(200).send("檔案無資料")
            }

        } else {
            resp.status(200).send("未上傳log")
        }
    },
    writeLineToFile: (req, resp, next) => {
        let count = 0
        let startTime = moment().valueOf()
        let data = []
        let dif = 0
        console.log('\033[0;31mStart processing\033[0m')

        Promise.all(req.lines.map((line, i) => {
            return new Promise((resolve, reject) => {
                let processTime = moment().valueOf()
                let [s1, request, s2, referer, n1, user_agent] = line.split(`"`)

                if (s1 && s2) {
                    let [host, client_ip, user_id, user_name, ...s4] = s1.split(` `)
                    let [n2, status_code, response_size] = s2.split(` `)
                    let [vmhost, vmport] = host.split(`:`)
                    let date_time = s4[0].replace(`[`, ``) + ` ` + s4[1].replace(`]`, ``)

                    const log = {
                        vmhost: vmhost,
                        vmport: vmport,
                        client_ip: client_ip,
                        user_id: user_id,
                        user_name: user_name,
                        date_time: date_time,
                        request: request,
                        status_code: status_code,
                        response_size: response_size,
                        referer: referer,
                        user_agent: user_agent
                    }

                    let d = []
                    req.fields.forEach(v => {
                        d.push(log[v])
                    })

                    data[i] = d

                    let diff = dif = Math.floor((processTime - startTime) / 5000)
                    if (count !== diff && diff !== 0) {
                        count = diff
                        console.log('Process lines: ' + i)
                    }

                    resolve()
                } else {
                    resolve()
                }

            })
        })).then(() => {
            console.log('\033[0;31mEnd processing\033[0m')

            data.forEach(d => {
                req.data.push(d)
            })
            next()
        }).catch(e => {
            console.log(e)
        })

    }
}