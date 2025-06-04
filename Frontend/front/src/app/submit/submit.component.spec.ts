import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SubmitComponent } from './submit.component';

// Mock PrimeNG modules
const mockPrimeModules = [
  // Add minimal mock implementations if needed
];

describe('SubmitComponent', () => {
  let component: SubmitComponent;
  let fixture: ComponentFixture<SubmitComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SubmitComponent,
        HttpClientTestingModule,
        FormsModule,
        NoopAnimationsModule
      ],
      providers: [
        ConfirmationService,
        MessageService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default menu structure', () => {
    expect(component.menu).toBeDefined();
    expect(component.menu.menuSections).toEqual([]);
    expect(component.newSection).toBeDefined();
    expect(component.newItem).toBeDefined();
  });

  it('should add new menu section', () => {
    const initialSectionCount = component.menu.menuSections.length;
    component.newSection.name = 'Test Section';
    component.newSection.description = 'Test Description';

    component.addSection();

    expect(component.menu.menuSections.length).toBe(initialSectionCount + 1);
    expect(component.menu.menuSections[0].name).toBe('Test Section');
    expect(component.menu.menuSections[0].description).toBe('Test Description');
  });

  it('should not add section without name', () => {
    const initialSectionCount = component.menu.menuSections.length;
    component.newSection.name = '';
    component.newSection.description = 'Test Description';

    component.addSection();

    expect(component.menu.menuSections.length).toBe(initialSectionCount);
  });

  it('should add new menu item to section', () => {
    // First add a section
    component.newSection.name = 'Test Section';
    component.addSection();

    const section = component.menu.menuSections[0];
    const initialItemCount = section.menuItems.length;

    component.newItem.name = 'Test Item';
    component.newItem.description = 'Test Description';
    component.newItem.price = 10.99;
    component.selectedSection = section;

    component.addItem();

    expect(section.menuItems.length).toBe(initialItemCount + 1);
    expect(section.menuItems[0].name).toBe('Test Item');
    expect(section.menuItems[0].price).toBe(10.99);
  });

  it('should delete menu section', () => {
    // First add a section
    component.newSection.name = 'Test Section';
    component.addSection();

    const initialSectionCount = component.menu.menuSections.length;
    const sectionToDelete = component.menu.menuSections[0];

    component.deleteSection(sectionToDelete.id);

    expect(component.menu.menuSections.length).toBe(initialSectionCount - 1);
  });

  it('should delete menu item', () => {
    // Setup: add section and item
    component.newSection.name = 'Test Section';
    component.addSection();

    const section = component.menu.menuSections[0];
    component.newItem.name = 'Test Item';
    component.selectedSection = section;
    component.addItem();

    const initialItemCount = section.menuItems.length;
    const itemToDelete = section.menuItems[0];

    component.deleteItem(itemToDelete.id);

    expect(section.menuItems.length).toBe(initialItemCount - 1);
  });

  it('should validate required fields', () => {
    // Test section validation
    component.newSection.name = '';
    expect(component.isValidSection()).toBeFalsy();

    component.newSection.name = 'Valid Name';
    expect(component.isValidSection()).toBeTruthy();

    // Test item validation
    component.newItem.name = '';
    component.selectedSection = null;
    expect(component.isValidItem()).toBeFalsy();

    // Add section for item validation
    component.newSection.name = 'Test Section';
    component.addSection();
    component.selectedSection = component.menu.menuSections[0];
    component.newItem.name = 'Valid Item';
    expect(component.isValidItem()).toBeTruthy();
  });

  it('should reset form after adding section', () => {
    component.newSection.name = 'Test Section';
    component.newSection.description = 'Test Description';

    component.addSection();

    expect(component.newSection.name).toBe('');
    expect(component.newSection.description).toBe('');
  });

  it('should reset form after adding item', () => {
    // Setup section
    component.newSection.name = 'Test Section';
    component.addSection();
    component.selectedSection = component.menu.menuSections[0];

    // Add item
    component.newItem.name = 'Test Item';
    component.newItem.description = 'Test Description';
    component.newItem.price = 10.99;

    component.addItem();

    expect(component.newItem.name).toBe('');
    expect(component.newItem.description).toBe('');
    expect(component.newItem.price).toBe(0);
  });
});
