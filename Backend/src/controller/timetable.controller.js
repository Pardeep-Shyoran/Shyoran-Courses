import Timetable from "../models/timetable.model.js";

// @desc    Get all timetable slots for authenticated user
// @route   GET /api/timetable
export const getTimetableSlots = async (req, res) => {
  try {
    const slots = await Timetable.find({ user: req.user._id }).sort({ startTime: 1 });
    return res.status(200).json(slots);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch timetable slots." });
  }
};

// @desc    Create a new timetable slot
// @route   POST /api/timetable
export const createTimetableSlot = async (req, res) => {
  try {
    const { title, startTime, endTime, daysOfWeek, category, colorTag, notes } = req.body;

    if (!title || !startTime || !endTime || !daysOfWeek || !daysOfWeek.length) {
      return res.status(400).json({ message: "Please provide title, start time, end time, and at least one day of week." });
    }

    const slot = await Timetable.create({
      user: req.user._id,
      title: title.trim(),
      startTime,
      endTime,
      daysOfWeek,
      category: category || "Study",
      colorTag: colorTag || "#6366f1",
      notes: notes ? notes.trim() : "",
      completedDates: []
    });

    return res.status(201).json(slot);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to create timetable slot." });
  }
};

// @desc    Update a timetable slot
// @route   PUT /api/timetable/:id
export const updateTimetableSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, startTime, endTime, daysOfWeek, category, colorTag, notes } = req.body;

    const slot = await Timetable.findOne({ _id: id, user: req.user._id });
    if (!slot) {
      return res.status(404).json({ message: "Timetable slot not found." });
    }

    if (title) slot.title = title.trim();
    if (startTime) slot.startTime = startTime;
    if (endTime) slot.endTime = endTime;
    if (daysOfWeek) slot.daysOfWeek = daysOfWeek;
    if (category) slot.category = category;
    if (colorTag) slot.colorTag = colorTag;
    if (notes !== undefined) slot.notes = notes.trim();

    await slot.save();
    return res.status(200).json(slot);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to update timetable slot." });
  }
};

// @desc    Delete a timetable slot
// @route   DELETE /api/timetable/:id
export const deleteTimetableSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await Timetable.findOneAndDelete({ _id: id, user: req.user._id });

    if (!slot) {
      return res.status(404).json({ message: "Timetable slot not found." });
    }

    return res.status(200).json({ message: "Timetable slot deleted successfully.", id });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to delete timetable slot." });
  }
};

// @desc    Toggle completion for a specific date (defaults to today 'YYYY-MM-DD')
// @route   PATCH /api/timetable/:id/toggle
export const toggleTimetableSlotDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateStr } = req.body; // e.g. "2026-07-28"

    const targetDateStr = dateStr || new Date().toISOString().split("T")[0];

    const slot = await Timetable.findOne({ _id: id, user: req.user._id });
    if (!slot) {
      return res.status(404).json({ message: "Timetable slot not found." });
    }

    const dateIdx = slot.completedDates.indexOf(targetDateStr);
    if (dateIdx > -1) {
      slot.completedDates.splice(dateIdx, 1);
    } else {
      slot.completedDates.push(targetDateStr);
    }

    await slot.save();
    return res.status(200).json(slot);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to toggle slot completion date." });
  }
};
