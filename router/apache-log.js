const express = require('express')
const router = express.Router()

const multer = require('multer')
const bodyParser = require('body-parser')
const { writeToBuffer } = require('@fast-csv/format')
const middlewares = require('../middlewares/apache-log')
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
    middlewares.checkFile,
    middlewares.writeLineToFile,
    async (req, resp) => {
        resp.setHeader('Content-Type', 'text/csv')
        resp.setHeader('Content-Disposition', 'attachment; filename=log.csv')
        writeToBuffer(req.data).then(d => {
            resp.status(200).send(d)
        })
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