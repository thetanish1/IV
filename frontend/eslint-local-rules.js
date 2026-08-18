module.exports = {
  'no-ai-look': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Disallow generic AI-generated Tailwind classes',
      },
      schema: [], // no options
    },
    create(context) {
      const banned = [
        /bg-(indigo|violet|purple|slate|blue)-[0-9]+/,
        /text-(indigo|violet|purple|slate|blue)-[0-9]+/,
        /rounded-(2xl|3xl)/,
        /from-purple-\d+/,
        /via-indigo-\d+/,
        /to-(blue|pink)-\d+/,
      ];
      return {
        Literal(node) {
          if (typeof node.value !== 'string') return;
          for (const pattern of banned) {
            if (pattern.test(node.value)) {
              context.report({
                node,
                message: `Banned default-AI class detected: ${node.value}`,
              });
            }
          }
        },
        TemplateElement(node) {
          if (typeof node.value.raw !== 'string') return;
          for (const pattern of banned) {
            if (pattern.test(node.value.raw)) {
              context.report({
                node,
                message: `Banned default-AI class detected: ${node.value.raw.trim()}`,
              });
            }
          }
        },
      };
    },
  },
};
