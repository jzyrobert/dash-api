const db = require('../db')

const fullevent = (req, res) => {
  if (!req.user || !req.query.id) {
    res.status(400)
    res.send({
      success: false
    })
    return
  }

  db.Event.findOne({
    where: { event_id: req.query.id },
    attributes: {
      exclude: ['image']
    }
  })
    .then(event => {
      if (event === null) {
        throw new Error('Non existent event requested')
      }
      if (event.accountAccountId != req.user.dataValues.account_id) {
        throw new Error('User requested event not belonging to them')
      }

      db.Attendee.findAll({
        attributes: ['fname', 'sname', 'diet'],
        where: { eventEventId: event.event_id }
      })
        .then(attendees => {
          db.Transport.findOne({
            include: [{
              model: db.Event,
              where: { event_id: event.event_id }
            }]
          })
            .then(transport => {
              res.status(200)
              if (transport === null) {
                transport = {}
              }
              res.send({
                success: true,
                events: event,
                attendees: attendees,
                transport: transport
              })
            })
        })
    })
    .catch(err => {
      console.log(err)
      res.status(400)
      res.send({
        success: false,
        message: 'This event does not exist!'
      })
    })
}

module.exports = fullevent