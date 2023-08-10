---
title: "GraphQL API"
comments: false
toc: true
images:
  - "florian-krumm-yLDabpoCL3s-unsplash-5120x1051.jpg"
menu:
  developers:
    parent: 'Marketplace'
    weight: 99
---





## About GraphQL

The [GraphQL](https://graphql.github.io/) data query language is:

- **[A specification.](https://graphql.github.io/graphql-spec/June2018/)** The spec determines the validity of the schema on the API server. The schema determines the validity of client calls.

- **Strongly typed.** The schema defines an API's type system and all object relationships.

- **Introspective.** A client can query the schema for details about the schema.

- **Hierarchical.** The shape of a GraphQL call mirrors the shape of the JSON data it returns. Nested fields let you query for and receive only the data you specify in a **single round trip.**

- **An application layer.** GraphQL is not a storage model or a database query language. The graph refers to graph structures defined in the schema, where nodes define objects and edges define relationships between objects. The API traverses and returns application data based on the schema definitions, independent of how the data is stored.

## Endpoint

[https://fashionunited.com/graphql/](https://fashionunited.com/graphql/)

## The GraphiQL Playground

[https://fashionunited.com/graphiql/](https://fashionunited.com/graphiql/)

## My first query

GraphQL is self-documenting, therefore you should be able to figure out possible queries by having a look at the documentation found in the playground. The <span class="bg-green">green tab</span> on the right opens up the schema.

To help you getting started, here's some example queries for the Marketplace.

```graphql
{
  productsConnection(locales: ["en-US"], brandIds: [1827], first: 20 ){
    edges {
      node {
        id
        name
        description
        sizes
        season
        brand{
          name
        }
        imageUrl       
      }
    }
  }
}
```

- This is shabbies: `brandIds: [1827]`
- Don't request too much at once or you will get an error. We make use of **Query Complexity** to limit your calls.
- Without an **API key** you can only request public data.

### Pagination

Pagination works by specifying limit and offset:

```graphql
{
  products(locales: ["en-US"], brandIds: [1827], limit: 20, offset: 10) {
    id
    name
    imageUrl
    brand{
      name
    }
    sizes
    colors {
      name
    }
  }
}
```

Have fun exploring and let us know what you plan to build!
