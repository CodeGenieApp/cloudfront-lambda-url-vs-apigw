import type { AppDefinition } from '@codegenie/cli'

const appDefinition: AppDefinition = {
  permissionModel: 'Global',
  defaultAuthRouteEntityName: 'Recipe',
  region: 'us-west-2',
  appId: '01J7GPC8YEMXFBJVH7GSYJ7H2R',
  description: 'Recipes App',
  name: 'Recipes',
  entities: {
    Ingredient: {
      properties: {
        ingredientId: {
          isIdProperty: true,
          type: 'string',
        },
        name: {
          isRequired: true,
          isNameProperty: true,
          type: 'string',
        },
      },
      ui: {
        showEditInCardList: true,
        showEditInTable: true,
        listView: 'Table',
        listPagePermission: 'All',
        remainOnCurrentPageOnCreate: true,
        showInParentDetailsPage: true,
        generateDetailsPage: false,
      },
      permissions: {
        create: 'Inherit',
        get: 'Inherit',
        delete: 'Inherit',
        list: 'Inherit',
        update: 'Inherit',
      },
    },
    Recipe: {
      properties: {
        createdDate: {
          isRequired: true,
          type: 'date',
        },
        description: {
          isRequired: true,
          format: 'multiline',
          type: 'string',
        },
        image: {
          isMainImageProperty: true,
          type: 'image',
        },
        recipeId: {
          isIdProperty: true,
          type: 'string',
        },
        tags: {
          relatedEntityName: 'Tag',
          type: 'array',
          ui: {
            showInDetails: true,
            showInCardList: true,
            showInReadView: true,
            showInTable: true,
          },
        },
        title: {
          isRequired: true,
          isNameProperty: true,
          type: 'string',
        },
      },
      ui: {},
    },
    RecipeIngredient: {
      parentEntityName: 'Recipe',
      properties: {
        ingredientId: {
          isRequired: true,
          isIdProperty: true,
          relatedEntityName: 'Ingredient',
          isNameProperty: true,
          type: 'string',
          ui: {
            showInTable: true,
            showInDetails: true,
            showInCardList: true,
            showInReadView: true,
          },
        },
        qty: {
          type: 'number',
        },
        recipeId: {
          type: 'string',
        },
        unit: {
          enumOptions: ['g', 'tbsp', 'tsp', 'cup'],
          type: 'enum',
          ui: {
            showInDetails: true,
            showInCardList: true,
            showInReadView: true,
            showInTable: true,
          },
        },
      },
      ui: {
        showEditInCardList: true,
        showEditInTable: true,
        listView: 'Table',
        listPagePermission: 'All',
        showInParentDetailsPage: true,
        generateDetailsPage: true,
      },
      permissions: {
        create: 'Inherit',
        get: 'Inherit',
        delete: 'Inherit',
        list: 'Inherit',
        update: 'Inherit',
      },
    },
    RecipeRating: {
      parentEntityName: 'Recipe',
      properties: {
        comment: {
          format: 'multiline',
          type: 'string',
          ui: {
            showInDetails: true,
            showInCardList: true,
            showInReadView: true,
            showInTable: true,
          },
        },
        createdByUserId: {
          type: 'string',
        },
        recipeId: {
          type: 'string',
        },
        recipeRatingId: {
          isIdProperty: true,
          type: 'string',
        },
        value: {
          max: 5,
          min: 1,
          type: 'number',
          ui: {
            showInDetails: true,
            showInCardList: true,
            showInReadView: true,
            showInTable: true,
          },
        },
      },
      ui: {
        showEditInCardList: true,
        showEditInTable: true,
        listView: 'Table',
        listPagePermission: 'All',
        showInParentDetailsPage: true,
        generateDetailsPage: true,
      },
      permissions: {
        create: 'Inherit',
        get: 'Inherit',
        delete: 'Inherit',
        list: 'Inherit',
        update: 'Inherit',
      },
    },
    ShoppingList: {
      properties: {
        name: {
          isNameProperty: true,
          type: 'string',
          ui: {
            showInDetails: true,
            showInCardList: true,
            showInReadView: true,
            showInTable: true,
          },
        },
        shoppingListId: {
          isIdProperty: true,
          type: 'string',
        },
      },
      ui: {
        showEditInCardList: true,
        showEditInTable: true,
        listView: 'Table',
        listPagePermission: 'All',
        showInParentDetailsPage: true,
        generateDetailsPage: true,
      },
      permissions: {
        create: 'All',
        get: 'CreatedByUser',
        delete: 'CreatedByUser',
        list: 'CreatedByUser',
        update: 'CreatedByUser',
      },
    },
    ShoppingListItem: {
      parentEntityName: 'ShoppingList',
      properties: {
        ingredientId: {
          isIdProperty: true,
          relatedEntityName: 'Ingredient',
          isNameProperty: true,
          type: 'string',
          ui: {
            showInTable: true,
            showInDetails: true,
            showInCardList: true,
            showInReadView: true,
          },
        },
        qty: {
          type: 'number',
        },
        shoppingListId: {
          type: 'string',
        },
      },
      ui: {
        showEditInCardList: true,
        showEditInTable: true,
        listView: 'Table',
        listPagePermission: 'All',
        showInParentDetailsPage: true,
        generateDetailsPage: true,
      },
      permissions: {
        create: 'All',
        get: 'CreatedByUser',
        delete: 'CreatedByUser',
        list: 'CreatedByUser',
        update: 'CreatedByUser',
      },
    },
    Step: {
      parentEntityName: 'Recipe',
      properties: {
        instructions: {
          format: 'multiline',
          type: 'string',
          ui: {
            showInDetails: true,
            showInCardList: true,
            showInReadView: true,
            showInTable: true,
          },
        },
        stepId: {
          isIdProperty: true,
          type: 'string',
        },
        stepNumber: {
          type: 'string',
        },
      },
      ui: {
        remainOnCurrentPageOnCreate: true,
        generateDetailsPage: false,
      },
    },
    Tag: {
      properties: {
        name: {
          isNameProperty: true,
          type: 'string',
          ui: {
            showInDetails: true,
            showInCardList: true,
            showInReadView: true,
            showInTable: true,
          },
        },
        tagId: {
          isIdProperty: true,
          type: 'string',
        },
      },
      ui: {
        showEditInCardList: true,
        showEditInTable: true,
        listView: 'Table',
        listPagePermission: 'All',
        showInParentDetailsPage: true,
        generateDetailsPage: true,
      },
      permissions: {
        create: 'Admin',
        get: 'All',
        delete: 'Admin',
        list: 'All',
        update: 'Admin',
      },
    },
  },
  theme: {
    primaryColor: '#579ddd',
  },
}

export default appDefinition
