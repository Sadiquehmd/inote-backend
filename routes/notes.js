const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

//Route1: get all users using "api/notes/fetchallnotes".Login Required
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  const notes = await Notes.find({ user: req.user.id });
  res.json(notes);
});
//Route2: Add noted using "api/notes/addnotes". Login Required
router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Title must be of atleast 5 character").isLength({ min: 5 }),
    body(
      "description",
      "description should be of more than 10 characters"
    ).isLength({ min: 10 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tags } = req.body;
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.send({ errors: result.array() }); //if got any errors it will return the error
      }
      const notes = await Notes.create({
        title,
        description,
        tags,
        user: req.user.id,
      });
      res.json(notes);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal server error");
    }
  }
);
//Route3: Update Notes using "api/notes/update". Login Required
router.put("/update/:id", fetchUser, async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tags) {
      newNote.tags = tags;
    }
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }
    if (note.user.toString() != req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal server error");
  }
});
//Route 4: Delete Notes using "api/notes/update". Login Required
router.delete("/delete/:id", fetchUser, async (req, res) => {
  try {
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }
    if (note.user.toString() != req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ success: "Note has been deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal server error");
  }
});
module.exports = router;
