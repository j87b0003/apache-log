const express = require('express')
const router = express.Router()

const multer = require('multer')
const bodyParser = require('body-parser')
const { writeToBuffer } = require('@fast-csv/format')

/**
 * POST Apache Log
 * @data log: LOG
 * 
 * Return
 * @data csv: CSV
 */
router.get('/upload',
    async (req, resp) => {
        const fields = [
            "vmhost",
            "vmport",
            "client_ip",
            "user_id",
            "user_name",
            "date_time",
            "request",
            "status_code",
            "response_size",
            "referer",
            "user_agent"
        ]

        resp.render(
            'upload',
            {
                fields: fields
            }
        )
    }
)

/**
 * POST Apache Log
 * @data log: LOG
 * 
 * Return
 * @data csv: CSV
 */
router.post('/parser',
    bodyParser.urlencoded({ extended: false }),
    bodyParser.json(),
    multer().fields([
        {
            name: 'log',
            maxCount: 1
        }
    ]),
    async (req, resp) => {
        const files = req.files['log']
        if (files) {
            const file = files[0]
            let fields = req.body.fields

            if (!fields) {
                fields = ['date_time', 'request', 'status_code']
            }
            const lines = Buffer.from(file.buffer).toString().split('\n')

            if (lines) {
                let data = []
                data.push(fields)

                lines.forEach(val => {
                    let [s1, request, s2, referer, n1, user_agent] = val.split(`"`)
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
                    fields.forEach(v => {
                        d.push(log[v])
                    })
                    data.push(d)
                })

                resp.setHeader('Content-Type', 'text/csv')
                resp.setHeader('Content-Disposition', 'attachment; filename=log.csv')
                writeToBuffer(data).then(d => {
                    resp.status(200).send(d)
                })
            } else {
                resp.status(200).send("檔案無資料")
            }
        } else {
            resp.status(200).send("未上傳log")
        }

    }
)

/**
 * GET
 * 
 * Return
 * @data log: Log
 */
router.get('/download',
    async (req, resp) => {
        const file = `${__dirname}/../apache.log`
        resp.download(file)
    }
)
module.exports = router