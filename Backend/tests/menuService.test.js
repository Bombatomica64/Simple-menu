// Test suite for menu service functionality
const menuService = require('../src/services/menuService');

describe('Menu Service', () => {
  beforeEach(() => {
    // Initialize empty menu state for testing
    const testMenu = {
      createdAt: new Date().toISOString(),
      menuItems: [],
      menuSections: [],
      pastaTypes: [],
      pastaSauces: [],
    };
    menuService.setCurrentMenu(testMenu);
  });

  describe('Menu Initialization', () => {
    test('should get current menu', () => {
      const menu = menuService.getCurrentMenu();
      expect(menu).toBeDefined();
      expect(typeof menu).toBe('object');
      expect(menu.menuItems).toBeDefined();
      expect(menu.menuSections).toBeDefined();
    });

    test('should set current menu', () => {
      const newMenu = {
        createdAt: new Date().toISOString(),
        menuItems: [{id: 1, name: 'Test Item', price: 10}],
        menuSections: [{id: 1, name: 'Test Section'}],
        pastaTypes: [],
        pastaSauces: [],
      };
      
      menuService.setCurrentMenu(newMenu);
      const retrievedMenu = menuService.getCurrentMenu();
      expect(retrievedMenu.menuItems).toHaveLength(1);
      expect(retrievedMenu.menuSections).toHaveLength(1);
    });
  });

  describe('Menu Sections Management', () => {
    test('should add new section', async () => {
      const newSection = {
        name: 'Test Section'
      };

      const result = await menuService.addSectionToMenu(newSection);
      expect(result).toBeTruthy();
      expect(result.name).toBe('Test Section');

      const menu = menuService.getCurrentMenu();
      const addedSection = menu.menuSections.find(s => s.name === 'Test Section');
      expect(addedSection).toBeDefined();
      expect(addedSection.name).toBe('Test Section');
      expect(addedSection.position).toBe(0);
    });

    test('should not add section without name', async () => {
      const invalidSection = {
        description: 'Test Description'
      };

      const result = await menuService.addSectionToMenu(invalidSection);
      expect(result).toBe(false);
    });

    test('should remove section', async () => {
      // First add a section
      const newSection = {
        name: 'Test Section'
      };
      const addedSection = await menuService.addSectionToMenu(newSection);
      const sectionId = addedSection.id;

      // Remove the section
      const result = await menuService.removeSectionFromMenu(sectionId);
      expect(result).toBe(true);

      const menu = menuService.getCurrentMenu();
      const deletedSection = menu.menuSections.find(s => s.id === sectionId);
      expect(deletedSection).toBeUndefined();
    });

    test('should update section order', async () => {
      // Add two sections
      const section1 = await menuService.addSectionToMenu({name: 'Section 1'});
      const section2 = await menuService.addSectionToMenu({name: 'Section 2'});

      // Update order
      const updates = [
        {id: section1.id, position: 1},
        {id: section2.id, position: 0}
      ];

      const result = await menuService.updateSectionOrder(updates);
      expect(result).toBe(true);

      const menu = menuService.getCurrentMenu();
      expect(menu.menuSections[0].name).toBe('Section 2');
      expect(menu.menuSections[1].name).toBe('Section 1');
    });
  });

  describe('Menu Items Management', () => {
    test('should add new item to menu', async () => {
      const newItem = {
        name: 'Test Item',
        price: 12.99
      };

      const result = await menuService.addItemToMenu(newItem);
      expect(result).toBe(true);

      const menu = menuService.getCurrentMenu();
      const addedItem = menu.menuItems.find(i => i.name === 'Test Item');
      expect(addedItem).toBeDefined();
      expect(addedItem.price).toBe(12.99);
      expect(addedItem.id).toBeDefined();
    });

    test('should add item to specific section', async () => {
      // First add a section
      const section = await menuService.addSectionToMenu({name: 'Test Section'});
      
      const newItem = {
        name: 'Test Item',
        price: 12.99,
        sectionId: section.id
      };

      const result = await menuService.addItemToMenu(newItem);
      expect(result).toBe(true);

      const menu = menuService.getCurrentMenu();
      const addedItem = menu.menuItems.find(i => i.name === 'Test Item');
      expect(addedItem.sectionId).toBe(section.id);
    });

    test('should remove item from menu', async () => {
      // First add an item
      const newItem = {
        name: 'Test Item',
        price: 12.99
      };
      await menuService.addItemToMenu(newItem);

      const menu = menuService.getCurrentMenu();
      const addedItem = menu.menuItems.find(i => i.name === 'Test Item');
      const itemId = addedItem.id;

      // Remove the item
      const result = await menuService.removeItemFromMenu(itemId);
      expect(result).toBe(true);

      const updatedMenu = menuService.getCurrentMenu();
      const deletedItem = updatedMenu.menuItems.find(i => i.id === itemId);
      expect(deletedItem).toBeUndefined();
    });

    test('should move item to different section', async () => {
      // Add two sections
      const section1 = await menuService.addSectionToMenu({name: 'Section 1'});
      const section2 = await menuService.addSectionToMenu({name: 'Section 2'});

      // Add item to first section
      const newItem = {
        name: 'Test Item',
        price: 12.99,
        sectionId: section1.id
      };
      await menuService.addItemToMenu(newItem);

      const menu = menuService.getCurrentMenu();
      const item = menu.menuItems.find(i => i.name === 'Test Item');

      // Move to second section
      const result = await menuService.moveItemToSection(item.id, section2.id, 0);
      expect(result).toBe(true);

      const updatedMenu = menuService.getCurrentMenu();
      const movedItem = updatedMenu.menuItems.find(i => i.id === item.id);
      expect(movedItem.sectionId).toBe(section2.id);
    });
  });

  describe('Image Management', () => {
    test('should update menu item image', async () => {
      // Add an item
      const newItem = {
        name: 'Test Item',
        price: 12.99
      };
      await menuService.addItemToMenu(newItem);

      const menu = menuService.getCurrentMenu();
      const item = menu.menuItems.find(i => i.name === 'Test Item');

      // Update image
      const result = await menuService.updateMenuItemImage(item.id, '/path/to/image.jpg');
      expect(result).toBe(true);

      const updatedMenu = menuService.getCurrentMenu();
      const updatedItem = updatedMenu.menuItems.find(i => i.id === item.id);
      expect(updatedItem.imageUrl).toBe('/path/to/image.jpg');
    });

    test('should toggle show image for menu item', async () => {
      // Add an item
      const newItem = {
        name: 'Test Item',
        price: 12.99
      };
      await menuService.addItemToMenu(newItem);

      const menu = menuService.getCurrentMenu();
      const item = menu.menuItems.find(i => i.name === 'Test Item');

      // Toggle show image
      const result = await menuService.toggleMenuItemShowImage(item.id, true);
      expect(result).toBe(true);

      const updatedMenu = menuService.getCurrentMenu();
      const updatedItem = updatedMenu.menuItems.find(i => i.id === item.id);
      expect(updatedItem.showImage).toBe(true);
    });

    test('should add image to menu item', async () => {
      // Add an item
      const newItem = {
        name: 'Test Item',
        price: 12.99
      };
      await menuService.addItemToMenu(newItem);

      const menu = menuService.getCurrentMenu();
      const item = menu.menuItems.find(i => i.name === 'Test Item');

      // Add image
      const result = await menuService.addImageToMenuItem(item.id, '/path/to/image.jpg');
      expect(result).toBe(true);

      const updatedMenu = menuService.getCurrentMenu();
      const updatedItem = updatedMenu.menuItems.find(i => i.id === item.id);
      const availableImages = JSON.parse(updatedItem.availableImages);
      expect(availableImages).toContain('/path/to/image.jpg');
    });

    test('should remove image from menu item', async () => {
      // Add an item and image
      const newItem = {
        name: 'Test Item',
        price: 12.99
      };
      await menuService.addItemToMenu(newItem);

      const menu = menuService.getCurrentMenu();
      const item = menu.menuItems.find(i => i.name === 'Test Item');
      
      await menuService.addImageToMenuItem(item.id, '/path/to/image.jpg');

      // Remove image
      const result = await menuService.removeImageFromMenuItem(item.id, '/path/to/image.jpg');
      expect(result).toBe(true);

      const updatedMenu = menuService.getCurrentMenu();
      const updatedItem = updatedMenu.menuItems.find(i => i.id === item.id);
      const availableImages = JSON.parse(updatedItem.availableImages);
      expect(availableImages).not.toContain('/path/to/image.jpg');
    });
  });

  describe('Data Validation', () => {
    test('should reject invalid item data', async () => {
      const invalidItem = {
        // Missing required name field
        price: 12.99
      };

      const result = await menuService.addItemToMenu(invalidItem);
      expect(result).toBe(false);
    });

    test('should reject invalid price', async () => {
      const invalidItem = {
        name: 'Test Item',
        price: 'not-a-number'
      };

      const result = await menuService.addItemToMenu(invalidItem);
      expect(result).toBe(false);
    });

    test('should reject invalid section data', async () => {
      const invalidSection = {
        // Missing required name field
        description: 'Test Description'
      };

      const result = await menuService.addSectionToMenu(invalidSection);
      expect(result).toBe(false);
    });
  });
});