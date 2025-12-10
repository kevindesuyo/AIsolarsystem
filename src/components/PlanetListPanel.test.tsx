import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import PlanetListPanel from './PlanetListPanel';
import { Planet } from '../types';

describe('PlanetListPanel', () => {
  const baseProps = {
    planets: [] as Planet[],
    onUpdatePlanetParams: jest.fn(),
    onRemovePlanet: jest.fn(),
    onPredict: jest.fn(),
  };

  it('adds a planet with auto-generated name via quick add', () => {
    const handleAdd = jest.fn();
    render(
      <PlanetListPanel
        {...baseProps}
        onAddPlanet={handleAdd}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'おまかせ追加' }));

    expect(handleAdd).toHaveBeenCalledTimes(1);
    expect(handleAdd.mock.calls[0][0].name).toMatch(/^Planet_/);
  });

  it('auto-fills name when the field is left empty', () => {
    const handleAdd = jest.fn();
    render(
      <PlanetListPanel
        {...baseProps}
        onAddPlanet={handleAdd}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '追加' }));

    expect(handleAdd).toHaveBeenCalledTimes(1);
    expect(handleAdd.mock.calls[0][0].name).toMatch(/^Planet_/);
  });
});
