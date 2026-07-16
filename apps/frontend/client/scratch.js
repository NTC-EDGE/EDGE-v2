const clearFormAnswers = (formArray) => {
    return formArray.map(section => ({
        ...section,
        data: section.data?.map(fieldOrArray => {
            if (Array.isArray(fieldOrArray)) {
                return fieldOrArray.map(f => ({ ...f, value: '', isValid: false, error: '' }));
            }
            return { ...fieldOrArray, value: '', isValid: false, error: '' };
        })
    }));
};
