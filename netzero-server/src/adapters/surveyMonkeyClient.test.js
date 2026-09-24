const { _private } = require('./surveyMonkeyClient');

describe('surveyMonkeyClient email extraction', () => {
  test('prefers custom_variables.email when present', () => {
    const response = {
      custom_variables: {
        email: ' Guest@Example.COM '
      },
      pages: []
    };

    expect(_private.getResponseEmail(response)).toBe('guest@example.com');
  });

  test('reads email from Thai/English email question answer', () => {
    const response = {
      custom_variables: {},
      pages: [
        {
          questions: [
            {
              headings: [{ heading: 'e-mail อีเมล์' }],
              answers: [{ text: 'Guest@Example.COM' }]
            }
          ]
        }
      ]
    };

    expect(_private.getResponseEmail(response)).toBe('guest@example.com');
  });

  test('falls back to any email-looking open-ended answer', () => {
    const response = {
      custom_variables: {},
      pages: [
        {
          questions: [
            {
              headings: [{ heading: 'Contact details' }],
              answers: [{ text: 'Please contact me at Guest@Example.COM' }]
            }
          ]
        }
      ]
    };

    expect(_private.getResponseEmail(response)).toBe('guest@example.com');
  });

  test('matches normalized email against extracted response email', () => {
    const response = {
      custom_variables: {},
      pages: [
        {
          questions: [
            {
              headings: [{ heading: 'e-mail อีเมล์' }],
              answers: [{ text: 'Guest@Example.COM' }]
            }
          ]
        }
      ]
    };

    expect(_private.responseMatchesEmail(response, 'guest@example.com')).toBe(true);
  });
});
