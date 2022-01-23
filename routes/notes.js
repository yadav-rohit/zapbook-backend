const express = require("express");
const { body, validationResult } = require("express-validator");
var fetchUser = require("../middleware/fetchUser");
const Notes = require("../models/Notes");
const router = express.Router();

//Route1 to get all notes . GET"/api/notes/fetchallnotes" login req
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error");
  }
});

//Route 2 add addnote . POST "/api/notes/addnote"  login req
router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Enter valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 4 characters").isLength({
      min: 3,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      //if any error then send it
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      //returns saved note
      res.json(savedNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("internal server error");
    }
  }
);

//Route 3 to update note . PUT "/api/notes/updatetenote" . login req
router.put("/updatenote/:id", fetchUser ,  async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    const newNote = {};
    if(title){newNote.title = title};
    if(description){newNote.description = description};
    if(tag){newNote.tag = tag};

    //finding the note to update and updating it
    let note = await Notes.findById(req.params.id);
    if(!note){
      res.status(404).send("Not found");
    }
    if(note.user.toString() !== req.user.id){
      return res.status(404).send("Not Allowed");
    }

    note = await Notes.findByIdAndUpdate(req.params.id , {$set: newNote} , {new: true});
    res.send({note})
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error");
  }
});

//Route 4 to delete note . DELETE "/api/notes/deletenote" . login req
router.delete("/deletenote/:id", fetchUser ,  async (req, res) => {
  try {

    //finding the note to be deleted and delete it
    let note = await Notes.findById(req.params.id);
    if(!note){
      res.status(404).send("Not found");
    }
    //checking wether the person deleting owns the note or not
    if(note.user.toString() !== req.user.id){
      return res.status(404).send("Not Allowed");
    }
    const deleted_note_id = note.id;
    note = await Notes.findByIdAndDelete(req.params.id);
    res.send({deleted: deleted_note_id});
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error");
  }
});

module.exports = router;
