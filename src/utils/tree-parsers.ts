import { TreeNode } from "@/components/ui/tree-view"

export function parseJsonToTree(jsonString: string): TreeNode[] {
  try {
    const parsed = JSON.parse(jsonString)
    return [createJsonNode('root', parsed, 'root')]
  } catch (error) {
    return []
  }
}

function createJsonNode(key: string, value: any, id: string): TreeNode {
  if (Array.isArray(value)) {
    return {
      id,
      label: `${key} [${value.length}]`,
      type: 'array',
      children: value.map((item, index) => 
        createJsonNode(`[${index}]`, item, `${id}.${index}`)
      )
    }
  } else if (value !== null && typeof value === 'object') {
    const keys = Object.keys(value)
    return {
      id,
      label: `${key} {${keys.length}}`,
      type: 'object',
      children: keys.map(objKey => 
        createJsonNode(objKey, value[objKey], `${id}.${objKey}`)
      )
    }
  } else {
    return {
      id,
      label: key,
      type: 'property',
      value: value,
      children: []
    }
  }
}

export function parseHtmlToTree(htmlString: string): TreeNode[] {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlString, 'text/html')
    const body = doc.body
    
    const children: TreeNode[] = []
    Array.from(body.childNodes).forEach((node, index) => {
      const treeNode = createHtmlNode(node, `body.${index}`)
      if (treeNode) children.push(treeNode)
    })
    
    return children
  } catch (error) {
    return []
  }
}

function createHtmlNode(node: Node, id: string): TreeNode | null {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element
    const tagName = element.tagName.toLowerCase()
    const attributes = Array.from(element.attributes)
    
    const children: TreeNode[] = []
    
    // Add attributes as children
    attributes.forEach((attr, index) => {
      children.push({
        id: `${id}.attr.${index}`,
        label: attr.name,
        type: 'attribute',
        value: attr.value
      })
    })
    
    // Add child nodes
    Array.from(element.childNodes).forEach((child, index) => {
      const childNode = createHtmlNode(child, `${id}.${index}`)
      if (childNode) children.push(childNode)
    })
    
    return {
      id,
      label: `<${tagName}>`,
      type: 'tag',
      children: children.length > 0 ? children : undefined
    }
  } else if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim()
    if (text) {
      return {
        id,
        label: 'text',
        type: 'text',
        value: text.length > 50 ? text.substring(0, 50) + '...' : text
      }
    }
  }
  
  return null
}

export function parseCssToTree(cssString: string): TreeNode[] {
  try {
    const rules = parseCssRules(cssString)
    return rules.map((rule, index) => ({
      id: `rule.${index}`,
      label: rule.selector,
      type: 'rule' as const,
      children: rule.declarations.map((decl, declIndex) => ({
        id: `rule.${index}.decl.${declIndex}`,
        label: decl.property,
        type: 'declaration' as const,
        value: decl.value
      }))
    }))
  } catch (error) {
    return []
  }
}

interface CssRule {
  selector: string
  declarations: Array<{ property: string; value: string }>
}

function parseCssRules(cssString: string): CssRule[] {
  const rules: CssRule[] = []
  
  // Simple CSS parser - matches selector { declarations }
  const ruleRegex = /([^{]+)\{([^}]+)\}/g
  let match
  
  while ((match = ruleRegex.exec(cssString)) !== null) {
    const selector = match[1].trim()
    const declarationsText = match[2].trim()
    
    const declarations: Array<{ property: string; value: string }> = []
    const declRegex = /([^:;]+):([^:;]+)(?:;|$)/g
    let declMatch
    
    while ((declMatch = declRegex.exec(declarationsText)) !== null) {
      const property = declMatch[1].trim()
      const value = declMatch[2].trim()
      if (property && value) {
        declarations.push({ property, value })
      }
    }
    
    if (selector && declarations.length > 0) {
      rules.push({ selector, declarations })
    }
  }
  
  return rules
}