// Logo file management routes (upload/delete only - all other operations via WebSocket)
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { prisma } = require("../config/database");

// Multer configuration for logo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const logoDir = path.join(__dirname, "../../assets/logos");
    if (!fs.existsSync(logoDir)) {
      fs.mkdirSync(logoDir, { recursive: true });
    }
    cb(null, logoDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "logo-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, svg, webp)"));
    }
  },
});

// Upload logo and create Logo record
router.post("/upload", upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No logo file provided",
      });
    }

    const logoUrl = `/assets/logos/${req.file.filename}`;
    const logoName = req.body.name || `Logo ${new Date().toISOString()}`;

    // Create logo record in database
    const newLogo = await prisma.logo.create({
      data: {
        name: logoName,
        imageUrl: logoUrl,
        position: req.body.position || 'top-left',
        size: req.body.size || 'medium',
        opacity: parseFloat(req.body.opacity) || 1.0,
        isActive: false // File upload doesn't automatically activate - use WebSocket for activation
      }
    });

    console.log("✅ Logo uploaded and created successfully:", req.file.filename);

    res.json({
      success: true,
      logo: newLogo,
      message: "Logo uploaded successfully. Use WebSocket to activate or configure.",
    });
  } catch (error) {
    console.error("❌ Logo upload error:", error);

    // Clean up uploaded file if database operation failed
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("❌ Failed to cleanup uploaded file:", cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to upload logo: " + error.message,
    });
  }
});

// Delete logo (file cleanup only - removes both database record and file)
router.delete("/:id", async (req, res) => {
  try {
    const logoId = parseInt(req.params.id);

    if (isNaN(logoId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid logo ID",
      });
    }

    // Get logo details first
    const logo = await prisma.logo.findUnique({
      where: { id: logoId }
    });

    if (!logo) {
      return res.status(404).json({
        success: false,
        message: "Logo not found",
      });
    }

    // Check if logo is being used by any menus
    const menusUsingLogo = await prisma.menu.findMany({
      where: { logoId: logoId }
    });

    if (menusUsingLogo.length > 0) {
      // Remove logo from all menus first
      await prisma.menu.updateMany({
        where: { logoId: logoId },
        data: { logoId: null }
      });
    }

    // Delete logo from database
    await prisma.logo.delete({
      where: { id: logoId }
    });

    // Delete logo file
    const filename = path.basename(logo.imageUrl);
    const filePath = path.join(__dirname, "../../assets/logos", filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("✅ Logo file deleted:", filename);
    }

    console.log("✅ Logo deleted successfully:", logoId);

    res.json({
      success: true,
      message: "Logo deleted successfully",
      removedFromMenus: menusUsingLogo.length
    });
  } catch (error) {
    console.error("❌ Logo deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete logo: " + error.message,
    });
  }
});

// All other logo operations are handled via WebSocket
// See logoHandlers.js for WebSocket message handlers:
// - "getAvailableLogos" - Get all logos
// - "setMenuLogo" - Set current menu logo (activation)
// - "updateLogoSettings" - Update logo properties (position, size, opacity, etc.)
// - "updateLogo" - Update logo with new settings
// - "removeLogo" - Remove logo from current menu (without deleting file)
// - "deleteLogo" - Delete logo (handled here via REST for file cleanup)

module.exports = router;
