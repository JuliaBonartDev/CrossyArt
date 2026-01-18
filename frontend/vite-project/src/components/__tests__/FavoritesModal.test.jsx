import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FavoritesModal from '../components/FavoritesModal';
import * as patternService from '../services/patternService';

// Mock del servicio
vi.mock('../services/patternService');

// Mock de canvas para evitar crear archivos reales
HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  const mockBlob = new Blob(['mock image data'], { type: 'image/png' });
  callback(mockBlob);
});

describe('FavoritesModal Component', () => {
  let mockFavorites;
  let mockOnClose;
  let mockOnDeleteFavorite;

  beforeEach(() => {
    mockFavorites = [
      {
        id: 1,
        name: 'Pattern 1',
        size: 150,
        image_url: 'http://example.com/pattern1.png'
      },
      {
        id: 2,
        name: 'Pattern 2',
        size: 230,
        image_url: 'http://example.com/pattern2.png'
      }
    ];

    mockOnClose = vi.fn();
    mockOnDeleteFavorite = vi.fn();

    // Reset mocks
    vi.clearAllMocks();
  });

  it('debe renderizar el modal correctamente', () => {
    render(
      <FavoritesModal
        favorites={mockFavorites}
        onClose={mockOnClose}
        onDeleteFavorite={mockOnDeleteFavorite}
        show={true}
      />
    );

    expect(screen.getByText('My Favorites')).toBeInTheDocument();
    expect(screen.getByText('Pattern 1')).toBeInTheDocument();
    expect(screen.getByText('Pattern 2')).toBeInTheDocument();
  });

  it('debe mostrar mensaje cuando no hay favoritos', () => {
    render(
      <FavoritesModal
        favorites={[]}
        onClose={mockOnClose}
        onDeleteFavorite={mockOnDeleteFavorite}
        show={true}
      />
    );

    expect(screen.getByText(/no patterns saved/i)).toBeInTheDocument();
  });

  it('debe mostrar información del patrón correctamente', () => {
    render(
      <FavoritesModal
        favorites={mockFavorites}
        onClose={mockOnClose}
        onDeleteFavorite={mockOnDeleteFavorite}
        show={true}
      />
    );

    // Verificar que se muestran los datos
    expect(screen.getByText('Pattern 1')).toBeInTheDocument();
    expect(screen.getByText('Size: 150')).toBeInTheDocument();
  });

  it('debe manejar descargas correctamente', async () => {
    // Mock de URL.createObjectURL para evitar crear URLs reales
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();

    // Mock de createElement y appendChild
    const mockLink = {
      click: vi.fn(),
      href: '',
      download: ''
    };
    
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    render(
      <FavoritesModal
        favorites={mockFavorites}
        onClose={mockOnClose}
        onDeleteFavorite={mockOnDeleteFavorite}
        show={true}
      />
    );

    const downloadButtons = screen.getAllByText('Download');
    fireEvent.click(downloadButtons[0]);

    // Verificar que se preparó correctamente para descargar
    expect(mockLink.download).toBe('Pattern 1');
    expect(mockLink.click).toHaveBeenCalled();
  });

  it('debe manejar eliminaciones correctamente', async () => {
    patternService.deletePattern.mockResolvedValue({ success: true });

    render(
      <FavoritesModal
        favorites={mockFavorites}
        onClose={mockOnClose}
        onDeleteFavorite={mockOnDeleteFavorite}
        show={true}
      />
    );

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Aceptar confirmación
    window.confirm = vi.fn(() => true);

    await waitFor(() => {
      expect(patternService.deletePattern).toHaveBeenCalledWith(1);
      expect(mockOnDeleteFavorite).toHaveBeenCalledWith(1);
    });
  });

  it('debe cerrar modal cuando se hace click en X', () => {
    render(
      <FavoritesModal
        favorites={mockFavorites}
        onClose={mockOnClose}
        onDeleteFavorite={mockOnDeleteFavorite}
        show={true}
      />
    );

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('debe no mostrar modal cuando show es false', () => {
    const { container } = render(
      <FavoritesModal
        favorites={mockFavorites}
        onClose={mockOnClose}
        onDeleteFavorite={mockOnDeleteFavorite}
        show={false}
      />
    );

    expect(container.querySelector('.favorites-modal')).not.toBeInTheDocument();
  });
});

describe('Pattern Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock de fetch global
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete globalThis.fetch;
  });

  it('debe crear un patrón correctamente', async () => {
    const mockImageBlob = new Blob(['fake image'], { type: 'image/png' });
    const mockResponse = {
      id: 1,
      name: 'Test Pattern',
      size: 150,
      image_url: 'http://example.com/test.png'
    };

    // Mock de fetch sin crear archivos reales
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => mockResponse
    });

    const result = await patternService.createPattern({
      image: mockImageBlob,
      name: 'Test Pattern',
      size: 150,
      description: 'Test Description'
    });

    expect(result).toEqual(mockResponse);
    expect(globalThis.fetch).toHaveBeenCalled();
  });

  it('debe obtener favoritos correctamente', async () => {
    const mockFavorites = [
      { id: 1, name: 'Pattern 1', is_favorite: true }
    ];

    // Mock sin crear archivos
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockFavorites
    });

    const result = await patternService.getUserFavorites();

    expect(result).toEqual(mockFavorites);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/favorites/'),
      expect.any(Object)
    );
  });

  it('debe eliminar un patrón correctamente', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => ({})
    });

    const result = await patternService.deletePattern(1);

    expect(result.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/1/delete/'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('debe manejar errores en las peticiones', async () => {
    globalThis.fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(patternService.getUserFavorites()).rejects.toThrow('Network error');
  });
});
