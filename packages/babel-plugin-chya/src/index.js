const templateLiteralToArray = (expr, t) => {
  const exprs = [];

  expr.quasis.forEach((quasi, index) => {
    const val = quasi.value.raw.trim();
    if (val) {
      exprs.push(t.stringLiteral(val));
    }
    if (index < expr.expressions.length) {
      exprs.push(t.arrowFunctionExpression([], expr.expressions[index]));
    }
  });

  return exprs;
};

function processElement(element, t) {
  if (t.isJSXText(element)) {
    return t.stringLiteral(element.value.trim());
  } else if (t.isJSXExpressionContainer(element)) {
    return t.arrowFunctionExpression(
      [],
      t.blockStatement([t.returnStatement(element.expression)])
    );
  } else if (t.isTemplateLiteral(element)) {
    return t.arrayExpression(templateLiteralToArray(element, t));
  }

  if(element.children?.length) {
    element.children = element.children.map(elm => {
      const el = processElement(elm, t);
      return el ?? elm;
    });

    return element;
  }

  return null;
}

module.exports = function (babel) {
  const { types: t } = babel;

  return {
    visitor: {
      Program(path) {
        const body = path.node.body;
        const hasCreateComponentImport = body.some(
          node =>
            t.isImportDeclaration(node) &&
            node.source.value === "@chya/core" &&
            node.specifiers.some(
              specifier =>
                specifier.imported &&
                specifier.imported.name === "createComponent"
            )
        );

        if (!hasCreateComponentImport) {
          path.node.body.unshift(
            t.importDeclaration(
              [
                t.importSpecifier(
                  t.identifier("createComponent"),
                  t.identifier("createComponent")
                )
              ],
              t.stringLiteral("@chya/core")
            )
          );
        }
      },

      CallExpression(path) {
        const { callee, arguments: args } = path.node;
        if (
          t.isMemberExpression(callee) &&
          callee.object.name === "React" &&
          callee.property.name === "createElement"
        ) {
          path.node.callee = t.identifier("createComponent");

          path.node.arguments = args.reduce((items, arg) => {
            // Fragment conversion
            if (
              t.isMemberExpression(arg) &&
              arg.object.name === "React" &&
              arg.property.name === "Fragment"
            ) {
              items.push(t.numericLiteral(0));
              return items;
            }

            // Object conversion for attributes
            if (t.isObjectExpression(arg)) {
              arg.properties.forEach(prop => {
                if (
                  t.isJSXExpressionContainer(prop.value) &&
                  t.isCallExpression(prop.value.expression)
                ) {
                  prop.value.expression = t.arrowFunctionExpression(
                    [],
                    prop.value.expression
                  );
                }
              });
              items.push(arg);
              return items;
            }

            // Logical operator conversion
            if (t.isLogicalExpression(arg)) {
              items.push(t.arrowFunctionExpression([], arg));
              return items;
            }

            //
            if (t.isTemplateLiteral(arg)) {
              return items.concat(templateLiteralToArray(arg, t));
            }

            // Pass other arguments as is
            items.push(arg);
            return items;
          }, []);
        }
      },

      JSXFragment(path) {
        path.node.children = path.node.children.map(elm => {
          const processed = processElement(elm, t);

          if (processed) {
            return processed;
          }

          return elm;
        });
      },

      JSXElement(path) {
        const processed = processElement(path.node, t);

        if (processed) {
          path.replaceWith(processed);
        }
      },

      // Handle JSX attribute expressions
      JSXAttribute(path) {
        const { value } = path.node;

        // Check if the attribute value is an expression
        if (t.isJSXExpressionContainer(value)) {
          const expr = value.expression;
          let newExpr = [];

          // Wrap function calls inside attributes in arrow functions
          if (t.isCallExpression(expr)) {
            newExpr.push(t.arrowFunctionExpression([], expr));
          } else if (t.isTemplateLiteral(expr)) {
            if (
              path.node.name.name === "class" ||
              path.node.name.name === "className"
            ) {
              newExpr = newExpr.concat(templateLiteralToArray(expr, t));
            } else {
              newExpr.push(t.arrowFunctionExpression([], expr));
            }
          } else if (t.isStringLiteral(expr)) {
            newExpr.push(expr);
          }

          if (newExpr.length) {
            if (newExpr.length === 1) {
              path.node.value.expression = newExpr[0];
            } else {
              path.node.value.expression = t.arrayExpression(newExpr);
            }
          }
        }
      }
    }
  };
};
