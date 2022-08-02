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
    writeLineToFile: (req, resp, next, i = 0) => {
        if (i < req.lines.length) {
            const line = req.lines[i]
            console.log('Processing: ' + line)

            let [s1, request, s2, referer, n1, user_agent] = line.split(`"`)
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
            req.data.push(d)

            i++
            setTimeout(() => {
                apacheLog.writeLineToFile(req, resp, next, i)
            }, 1000);
        } else {
            console.log('\nTotal: ' + i)
            next()
        }

    }
}