export const formatValidationError = errors => {
  if (!errors || !errors.issues) return 'Invalid input';

  if (Array.isArray(errors.issues) && errors.issues.length > 0) {
    return errors.issues.map(issue => issue.message).join(', ');
  }

  return JSON.stringify(errors);
};
