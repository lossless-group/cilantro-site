import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const twentyApiKey = import.meta.env.TWENTY_API_KEY;
    const twentyUrl = import.meta.env.COGLET_TWENTY_PATH_ON_RAILWAY;

    if (!twentyApiKey || !twentyUrl) {
      console.error('Missing Twenty API configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Split email to extract name if possible
    const emailParts = email.split('@')[0].split(/[._-]/);
    const firstName = emailParts[0] || 'Newsletter';
    const lastName = emailParts[1] || 'Subscriber';

    // Prepare person data for Twenty CRM
    const personData = {
      email: email,
      name: {
        firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
      },
    };

    // Try REST API first, fall back to GraphQL if needed
    let response;
    let result;

    try {
      // Attempt REST API
      response = await fetch(`${twentyUrl}/rest/people`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${twentyApiKey}`,
        },
        body: JSON.stringify(personData),
      });

      result = await response.json();

      // If REST fails, try GraphQL
      if (!response.ok) {
        console.log('REST API failed, trying GraphQL...', result);

        const mutation = `
          mutation CreatePeople($data: [PersonCreateInput!]!) {
            createPeople(data: $data) {
              id
              email
              name {
                firstName
                lastName
              }
            }
          }
        `;

        response = await fetch(`${twentyUrl}/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${twentyApiKey}`,
          },
          body: JSON.stringify({
            query: mutation,
            variables: { data: [personData] },
          }),
        });

        result = await response.json();
      }
    } catch (apiError) {
      console.error('API request failed:', apiError);
      throw apiError;
    }

    if (result.errors) {
      console.error('Twenty API errors:', result.errors);
      return new Response(
        JSON.stringify({
          error: 'Failed to subscribe',
          details: result.errors[0]?.message || 'Unknown error'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!response.ok) {
      console.error('Twenty API error:', response.status, result);
      return new Response(
        JSON.stringify({
          error: 'Failed to subscribe',
          details: result.message || result.error || 'Unknown error'
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully subscribed to newsletter',
        data: result.data
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
