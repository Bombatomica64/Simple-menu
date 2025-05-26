const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Get all menu versions
app.get('/menus', async (req, res) => {
  const menus = await prisma.menu.findMany({ 
    orderBy: { createdAt: 'desc' },
    include: { menuItems: true } // Include related items
  });
  res.json(menus);
});

// Get latest menu
app.get('/menus/latest', async (req, res) => {
  const menu = await prisma.menu.findFirst({ 
    orderBy: { createdAt: 'desc' },
    include: { menuItems: true }
  });
  res.json(menu);
});

// Create new menu version
app.post('/menus', async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid items array' });
  }
  
  // Create menu and items in a single transaction
  const newMenu = await prisma.menu.create({
    data: {
      menuItems: {
        create: items.map(item => ({
          name: item.name,
          price: item.price
        }))
      }
    },
    include: { menuItems: true }
  });
  
  res.status(201).json(newMenu);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});