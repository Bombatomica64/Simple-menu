import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { MenuService } from './menu.service';
import { Menu, MenuSection, MenuItem } from './menu';

describe('MenuService', () => {
  let service: MenuService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MenuService]
    });
    service = TestBed.inject(MenuService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save menu via HTTP POST', () => {
    const mockMenu: Menu = {
      id: 1,
      name: 'Test Menu',
      description: 'Test Description',
      menuSections: [],
      pastaTypes: [],
      pastaSauces: []
    };

    service.saveMenu(mockMenu).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(req => req.url.includes('/menu') && req.method === 'POST');
    expect(req.request.body).toEqual(mockMenu);
    req.flush({ success: true });
  });

  it('should load menu via HTTP GET', () => {
    const mockMenu: Menu = {
      id: '1',
      name: 'Test Menu',
      description: 'Test Description',
      menuSections: [],
      pastaTypes: [],
      pastaSauces: []
    };

    service.loadMenu('1').subscribe(menu => {
      expect(menu).toEqual(mockMenu);
    });

    const req = httpMock.expectOne(req => req.url.includes('/menu/1') && req.method === 'GET');
    req.flush(mockMenu);
  });

  it('should handle HTTP errors gracefully', () => {
    service.loadMenu('invalid-id').subscribe({
      next: () => fail('Should not succeed'),
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });

    const req = httpMock.expectOne(req => req.url.includes('/menu/invalid-id'));
    req.flush('Menu not found', { status: 404, statusText: 'Not Found' });
  });

  it('should validate menu data before saving', () => {
    const invalidMenu: Partial<Menu> = {
      name: '', // Invalid: empty name
      description: 'Test Description'
    };

    expect(() => service.validateMenu(invalidMenu as Menu)).toThrow();
  });

  it('should create new menu with default values', () => {
    const newMenu = service.createNewMenu();

    expect(newMenu.id).toBeDefined();
    expect(newMenu.name).toBe('');
    expect(newMenu.description).toBe('');
    expect(newMenu.menuSections).toEqual([]);
    expect(newMenu.pastaTypes).toEqual([]);
    expect(newMenu.pastaSauces).toEqual([]);
  });
});
