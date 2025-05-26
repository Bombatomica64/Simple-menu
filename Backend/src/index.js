const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
// const cron = require('node-cron'); // Optional: for more complex scheduling

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: "/menu-updates" });
const clients = new Set();

let currentInMemoryMenu = null;

async function loadInitialMenu() {
  try {
    const latestMenuFromDB = await prisma.menu.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        menuItems: true,
        pastaTypes: { include: { pastaType: true } },
        pastaSauces: { include: { pastaSauce: true } },
      },
    });
    if (latestMenuFromDB) {
      currentInMemoryMenu = latestMenuFromDB;
      console.log("Initial menu loaded from DB into memory.");
    } else {
      currentInMemoryMenu = {
        // id: Date.now(), // DB will assign ID on save
        createdAt: new Date().toISOString(),
        menuItems: [],
        pastaTypes: [],
        pastaSauces: [],
      };
      console.log("No menu in DB, initialized a default empty in-memory menu.");
    }
  } catch (error) {
    console.error("Error loading initial menu:", error);
    currentInMemoryMenu = {
      /* fallback default structure */
    };
  }
}

function broadcastInMemoryMenu() {
  if (!currentInMemoryMenu) return;
  const menuToSend = JSON.stringify(currentInMemoryMenu);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(menuToSend);
    }
  });
}

async function sendLatestMenuToClient(ws) {
  if (currentInMemoryMenu && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(currentInMemoryMenu));
  }
}

wss.on("connection", (ws) => {
  console.log("Client connected to WebSocket");
  clients.add(ws);
  sendLatestMenuToClient(ws);

  ws.on("message", (messageString) => {
    try {
      const message = JSON.parse(messageString);
      console.log("Received message from client:", message);

      if (!currentInMemoryMenu) {
        console.warn("In-memory menu not initialized. Ignoring message.");
        return;
      }

      let updated = false;
      switch (message.type) {
        case "addItem":
          if (
            message.item &&
            typeof message.item.name === "string" &&
            typeof message.item.price === "number"
          ) {
            const newItem = {
              id: Date.now(), // Temporary in-memory ID
              name: message.item.name,
              price: message.item.price,
              // menuId will be associated on DB save
            };
            currentInMemoryMenu.menuItems.push(newItem);
            updated = true;
          }
          break;
        case "removeItem":
          if (typeof message.itemId === "number") {
            currentInMemoryMenu.menuItems =
              currentInMemoryMenu.menuItems.filter(
                (item) => item.id !== message.itemId
              );
            updated = true;
          }
          break;
        // TODO: Implement addPastaTypeToMenu, removePastaTypeFromMenu, etc.
        // Example: addPastaTypeToMenu would require pastaTypeId
        // It would then find the PastaType details (or assume client sends them)
        // and add to currentInMemoryMenu.pastaTypes as a MenuToPastaType-like structure.
        default:
          console.warn("Unknown message type:", message.type);
      }

      if (updated) {
        console.log("In-memory menu updated, broadcasting...");
        broadcastInMemoryMenu();
      }
    } catch (error) {
      console.error("Failed to process message or broadcast:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected from WebSocket");
    clients.delete(ws);
  });
});

app.get('/pasta-types', async (req, res) => {
  try {
    const pastaTypes = await prisma.pastaType.findMany({ orderBy: { name: 'asc' } });
    res.json(pastaTypes);
  } catch (error) {
    console.error('Error fetching pasta types:', error);
    res.status(500).json({ error: 'Failed to fetch pasta types' });
  }
});

app.post('/pasta-types', async (req, res) => {
  const { name, imageUrl } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Pasta type name is required' });
  }
  try {
    const newPastaType = await prisma.pastaType.create({
      data: { name, imageUrl: imageUrl || '' },
    });
    res.status(201).json(newPastaType);
  } catch (error) {
    console.error('Error creating pasta type:', error);
    if (error.code === 'P2002') { // Unique constraint failed
        return res.status(409).json({ error: 'Pasta type with this name already exists.' });
    }
    res.status(500).json({ error: 'Failed to create pasta type' });
  }
});

// --- API Endpoints for PastaSauces ---
app.get('/pasta-sauces', async (req, res) => {
  try {
    const pastaSauces = await prisma.pastaSauce.findMany({ orderBy: { name: 'asc' } });
    res.json(pastaSauces);
  } catch (error) {
    console.error('Error fetching pasta sauces:', error);
    res.status(500).json({ error: 'Failed to fetch pasta sauces' });
  }
});

app.post('/pasta-sauces', async (req, res) => {
  const { name, imageUrl } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Pasta sauce name is required' });
  }
  try {
    const newPastaSauce = await prisma.pastaSauce.create({
      data: { name, imageUrl: imageUrl || '' },
    });
    res.status(201).json(newPastaSauce);
  } catch (error) {
    console.error('Error creating pasta sauce:', error);
    if (error.code === 'P2002') { // Unique constraint failed
        return res.status(409).json({ error: 'Pasta sauce with this name already exists.' });
    }
    res.status(500).json({ error: 'Failed to create pasta sauce' });
  }
});


wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  clients.add(ws);
  sendLatestMenuToClient(ws); // Send current state

  ws.on('message', async (messageString) => { // Make this async to await prisma calls
    try {
      const message = JSON.parse(messageString);
      console.log('Received message from client:', message);

      if (!currentInMemoryMenu) {
        console.warn('In-memory menu not initialized. Ignoring message.');
        return;
      }

      let updated = false;
      switch (message.type) {
        case 'addItem':
          // ... existing addItem logic ...
          if (message.item && typeof message.item.name === 'string' && typeof message.item.price === 'number') {
            const newItem = {
              id: Date.now(), // Temporary in-memory ID
              name: message.item.name,
              price: message.item.price,
            };
            currentInMemoryMenu.menuItems.push(newItem);
            updated = true;
          }
          break;
        case 'removeItem':
          // ... existing removeItem logic ...
          if (typeof message.itemId === 'number') {
            currentInMemoryMenu.menuItems = currentInMemoryMenu.menuItems.filter(
              (item) => item.id !== message.itemId
            );
            updated = true;
          }
          break;
        case 'addPastaTypeToMenu':
          if (typeof message.pastaTypeId === 'number') {
            const pastaTypeExists = currentInMemoryMenu.pastaTypes.some(pt => pt.pastaType.id === message.pastaTypeId);
            if (!pastaTypeExists) {
              const pastaTypeToAdd = await prisma.pastaType.findUnique({ where: { id: message.pastaTypeId } });
              if (pastaTypeToAdd) {
                currentInMemoryMenu.pastaTypes.push({
                  // id: Date.now(), // Temp ID for join entry, DB will assign real one
                  // menuId: currentInMemoryMenu.id, // Will be set on DB save
                  pastaTypeId: pastaTypeToAdd.id,
                  pastaType: pastaTypeToAdd, // Embed the full object
                });
                updated = true;
              } else {
                console.warn(`PastaType with ID ${message.pastaTypeId} not found.`);
              }
            }
          }
          break;
        case 'removePastaTypeFromMenu':
          if (typeof message.pastaTypeId === 'number') {
            const initialLength = currentInMemoryMenu.pastaTypes.length;
            currentInMemoryMenu.pastaTypes = currentInMemoryMenu.pastaTypes.filter(
              (ptEntry) => ptEntry.pastaType.id !== message.pastaTypeId
            );
            if (currentInMemoryMenu.pastaTypes.length < initialLength) {
                updated = true;
            }
          }
          break;
        case 'addPastaSauceToMenu':
          if (typeof message.pastaSauceId === 'number') {
            const sauceExists = currentInMemoryMenu.pastaSauces.some(ps => ps.pastaSauce.id === message.pastaSauceId);
            if (!sauceExists) {
              const pastaSauceToAdd = await prisma.pastaSauce.findUnique({ where: { id: message.pastaSauceId } });
              if (pastaSauceToAdd) {
                currentInMemoryMenu.pastaSauces.push({
                  // id: Date.now(),
                  // menuId: currentInMemoryMenu.id,
                  pastaSauceId: pastaSauceToAdd.id,
                  pastaSauce: pastaSauceToAdd,
                });
                updated = true;
              } else {
                console.warn(`PastaSauce with ID ${message.pastaSauceId} not found.`);
              }
            }
          }
          break;
        case 'removePastaSauceFromMenu':
          if (typeof message.pastaSauceId === 'number') {
            const initialLength = currentInMemoryMenu.pastaSauces.length;
            currentInMemoryMenu.pastaSauces = currentInMemoryMenu.pastaSauces.filter(
              (psEntry) => psEntry.pastaSauce.id !== message.pastaSauceId
            );
            if (currentInMemoryMenu.pastaSauces.length < initialLength) {
                updated = true;
            }
          }
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }

      if (updated) {
        console.log('In-memory menu updated, broadcasting...');
        broadcastInMemoryMenu();
      }
    } catch (error) {
      console.error('Failed to process message or broadcast:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
    clients.delete(ws);
  });
});

app.use(cors());
app.use(bodyParser.json());

// GET endpoints remain for fetching historical/latest persisted menus if needed
app.get("/menus", async (req, res) => {
  const menus = await prisma.menu.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      menuItems: true,
      pastaTypes: { include: { pastaType: true } },
      pastaSauces: { include: { pastaSauce: true } },
    },
  });
  res.json(menus);
});

app.get("/menus/latest", async (req, res) => {
  // This could return the latest from DB or the current in-memory one
  // For consistency with WebSocket, let's return in-memory
  if (currentInMemoryMenu) {
    res.json(currentInMemoryMenu);
  } else {
    // Fallback to DB if in-memory not loaded
    const menu = await prisma.menu.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        menuItems: true,
        pastaTypes: { include: { pastaType: true } },
        pastaSauces: { include: { pastaSauce: true } },
      },
    });
    res.json(menu);
  }
});

// POST /menus is now for an admin to set a new live menu
app.post("/menus", async (req, res) => {
  const {
    menuItems,
    pastaTypes: linkedPastaTypes,
    pastaSauces: linkedPastaSauces,
  } = req.body;
  // Expecting menuItems: [{name, price}],
  // linkedPastaTypes: [{pastaTypeId, pastaType: {id, name, imageUrl}}],
  // linkedPastaSauces: [{pastaSauceId, pastaSauce: {id, name, imageUrl}}]

  if (!Array.isArray(menuItems)) {
    return res.status(400).json({ error: "Invalid menuItems array" });
  }

  try {
    const newMenuSavedToDB = await prisma.menu.create({
      data: {
        menuItems: {
          create: menuItems.map((item) => ({
            name: item.name,
            price: item.price,
          })),
        },
        pastaTypes: {
          create: (linkedPastaTypes || []).map((ptEntry) => ({
            pastaTypeId: ptEntry.pastaTypeId,
          })),
        },
        pastaSauces: {
          create: (linkedPastaSauces || []).map((psEntry) => ({
            pastaSauceId: psEntry.pastaSauceId,
          })),
        },
      },
      include: {
        // Crucial to get the full structure for in-memory
        menuItems: true,
        pastaTypes: { include: { pastaType: true } },
        pastaSauces: { include: { pastaSauce: true } },
      },
    });

    currentInMemoryMenu = newMenuSavedToDB; // Update the live in-memory menu
    broadcastInMemoryMenu(); // Broadcast the new state
    res.status(201).json(newMenuSavedToDB);
  } catch (error) {
    console.error("Error creating new menu via POST:", error);
    res.status(500).json({ error: "Failed to create menu" });
  }
});

async function saveInMemoryMenuToDB() {
  if (!currentInMemoryMenu || !currentInMemoryMenu.menuItems) {
    // check menuItems to ensure it's populated
    console.log("No valid in-memory menu to save or menu is empty.");
    return;
  }
  console.log("Attempting to save in-memory menu to DB (as a new version)...");
  try {
    const menuDataForDB = {
      menuItems: {
        create: currentInMemoryMenu.menuItems.map((item) => ({
          name: item.name,
          price: item.price,
        })),
      },
      pastaTypes: {
        create: currentInMemoryMenu.pastaTypes.map((mtpt) => ({
          pastaTypeId: mtpt.pastaType.id,
        })),
      },
      pastaSauces: {
        create: currentInMemoryMenu.pastaSauces.map((mtps) => ({
          pastaSauceId: mtps.pastaSauce.id,
        })),
      },
    };

    const savedMenu = await prisma.menu.create({ data: menuDataForDB });
    console.log(
      "In-memory menu snapshot saved to DB with new ID:",
      savedMenu.id
    );
  } catch (error) {
    console.error("Error saving in-memory menu to DB:", error);
  }
}

// Start server and initial load
(async () => {
  await loadInitialMenu();
  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(
      `WebSocket server running on ws://localhost:${PORT}/menu-updates`
    );

    // Schedule periodic save (e.g., every 12 hours)
    const SAVE_INTERVAL_MS = 2 * 60 * 60 * 1000;
    setInterval(saveInMemoryMenuToDB, SAVE_INTERVAL_MS);
    console.log(
      `Periodic saving to DB scheduled every ${
        SAVE_INTERVAL_MS / (60 * 60 * 1000)
      } hours.`
    );
    // For specific times like 10 AM & 10 PM, use node-cron:
    // cron.schedule('0 10,22 * * *', saveInMemoryMenuToDB);
  });
})();

