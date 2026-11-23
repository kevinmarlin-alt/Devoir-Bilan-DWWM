export const createEmptyPlaceForm = () => ({
    name: '',
    description: '',
    categoryId: null,
    exploitationTypeIds: [],
    imageIds: [],
    mainImageId: null
});

const normalizeId = (value) => {
    if (value === null || value === '' || value === undefined) {
        return null;
    }

    return Number(value);
};

export const placeToForm = (place) => ({
    name: place.name ?? '',
    description: place.description ?? '',
    categoryId: normalizeId(place.category?.categoryId ?? place.categoryId),
    exploitationTypeIds: (place.exploitationTypes ?? []).map((type) => (
        Number(type.exploitationTypeId)
    )),
    imageIds: (place.images ?? []).map((image) => Number(image.imageId)),
    mainImageId: normalizeId(
        (place.images ?? []).find((image) => image.isMain)?.imageId
    )
});

export const normalizePlaceForm = (form) => ({
    name: (form.name ?? '').trim(),
    description: (form.description ?? '').trim(),
    categoryId: normalizeId(form.categoryId),
    exploitationTypeIds: (form.exploitationTypeIds ?? [])
        .map(Number)
        .sort((firstId, secondId) => firstId - secondId),
    imageIds: (form.imageIds ?? []).map(Number),
    mainImageId: normalizeId(form.mainImageId)
});

export const arePlaceFormsEqual = (firstForm, secondForm) => (
    JSON.stringify(normalizePlaceForm(firstForm))
        === JSON.stringify(normalizePlaceForm(secondForm))
);

export const mergePlaceImages = (...imageLists) => {
    const imagesById = new Map();

    imageLists.flat().forEach((image) => {
        imagesById.set(Number(image.imageId), image);
    });

    return [...imagesById.values()];
};

export const isCompletePlaceForm = (form) => {
    const normalizedForm = normalizePlaceForm(form);

    return normalizedForm.name.length > 0
        && normalizedForm.description.length > 0
        && normalizedForm.categoryId !== null
        && normalizedForm.exploitationTypeIds.length > 0
        && normalizedForm.imageIds.length > 0
        && normalizedForm.mainImageId !== null
        && normalizedForm.imageIds.includes(normalizedForm.mainImageId);
};
