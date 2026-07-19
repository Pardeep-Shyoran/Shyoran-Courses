import Certificate from "../models/certificate.model.js";

// Fetch all certificates for the logged-in user
export async function getCertificates(req, res) {
  try {
    const userId = req.user._id;
    const certificates = await Certificate.find({ user: userId })
      .populate({
        path: "course",
        select: "title thumbnail description videos",
      })
      .sort({ completedAt: -1 });

    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch certificates", error: error.message });
  }
}

// Fetch a single certificate by certificateId or Mongoose ID (public verification)
export async function getCertificateById(req, res) {
  try {
    const { id } = req.params;

    // Search by certificateId first, then fallback to Mongoose ID
    let certificate = await Certificate.findOne({ certificateId: id })
      .populate("user", "name")
      .populate("course", "title thumbnail description videos");

    if (!certificate) {
      // Check if it's a valid ObjectId
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      if (isValidObjectId) {
        certificate = await Certificate.findById(id)
          .populate("user", "name")
          .populate("course", "title thumbnail description videos");
      }
    }

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: "Failed to verify certificate", error: error.message });
  }
}
