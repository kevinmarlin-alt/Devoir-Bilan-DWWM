import assert from 'node:assert/strict';
import test from 'node:test';

import { createPlaceSlug } from '../src/utilities/placeSlug.js';

test('normalizes accents, punctuation and surrounding spaces', () => {
    assert.equal(
        createPlaceSlug("  Château de l'Été !  "),
        'chateau-de-l-ete'
    );
});

test('collapses repeated separators', () => {
    assert.equal(createPlaceSlug('Villa   des---Pins'), 'villa-des-pins');
});
