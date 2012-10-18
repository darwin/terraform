# Copyright 2011 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# for Terraform modified by Antonin Hildebrand

class TreeMirror
  constructor: (root, delegate) ->
    @root = root
    @idMap = {}
    @delegate = delegate

  initialize: (rootId, children) ->
    @idMap[rootId] = @root
    i = 0

    while i < children.length
      @deserializeNode children[i], @root
      i++

  deserializeNode: (nodeData, parent) ->
    return null  if nodeData is null
    return @idMap[nodeData]  if typeof nodeData is "number"
    doc = (if @root instanceof HTMLDocument then @root else @root.ownerDocument)
    node = undefined
    switch nodeData.nodeType
      when Node.COMMENT_NODE
        node = doc.createComment(nodeData.textContent)
      when Node.TEXT_NODE
        node = doc.createTextNode(nodeData.textContent)
      when Node.DOCUMENT_TYPE_NODE
        node = doc.implementation.createDocumentType(nodeData.name, nodeData.publicId, nodeData.systemId)
      when Node.ELEMENT_NODE
        node = @delegate.createElement(nodeData.tagName)  if @delegate and @delegate.createElement
        node = doc.createElement(nodeData.tagName)  unless node
        Object.keys(nodeData.attributes).forEach ((name) ->
          node.setAttribute name, nodeData.attributes[name]  if not @delegate or not @delegate.setAttribute or not @delegate.setAttribute(node, name, nodeData.attributes[name])
        ), this
    @idMap[nodeData.id] = node
    parent.appendChild node  if parent
    if nodeData.childNodes
      i = 0

      while i < nodeData.childNodes.length
        @deserializeNode nodeData.childNodes[i], node
        i++
    node

  applyChanged: (removed, addedOrMoved, attributes, text) ->
    removeNode = (node) ->
      node.parentNode.removeChild node  if node.parentNode
    moveOrInsertNode = (data) ->
      parent = data.parentNode
      previous = data.previousSibling
      node = data.node
      parent.insertBefore node, (if previous then previous.nextSibling else parent.firstChild)
    updateAttributes = (data) ->
      node = @deserializeNode(data.node)
      Object.keys(data.attributes).forEach ((attrName) ->
        newVal = data.attributes[attrName]
        if newVal is null
          node.removeAttribute attrName
        else
          node.setAttribute attrName, newVal  if not @delegate or not @delegate.setAttribute or not @delegate.setAttribute(node, attrName, newVal)
      ), this
    updateText = (data) ->
      node = @deserializeNode(data.node)
      node.textContent = data.textContent
    addedOrMoved.forEach ((data) ->
      data.node = @deserializeNode(data.node)
      data.previousSibling = @deserializeNode(data.previousSibling)
      data.parentNode = @deserializeNode(data.parentNode)
      removeNode data.node
    ), this
    removed.map(@deserializeNode, this).forEach removeNode
    addedOrMoved.forEach moveOrInsertNode
    attributes.forEach updateAttributes, this
    text.forEach updateText, this
    removed.forEach ((id) ->
      delete @idMap[id]
    ), this


# NOTE: Applying the changes can result in an attempting to add a child
# to a parent which is presently an ancestor of the parent. This can occur
# based on random ordering of moves. The way we handle this is to first
# remove all changed nodes from their parents, then apply.
class TreeMirrorClient
  constructor: (target, mirror, testingQueries) ->
    @target = target
    @mirror = mirror
    @knownNodes = new MutationSummary.NodeMap
    rootId = @serializeNode(target).id
    children = []
    child = target.firstChild

    while child
      children.push @serializeNode(child, true)
      child = child.nextSibling
    @mirror.initialize rootId, children
    self = this
    queries = [all: true]
    queries = queries.concat(testingQueries)  if testingQueries
    console.log target
    @mutationSummary = new MutationSummary
      rootNode: target
      callback: (summaries) ->
        self.applyChanged summaries
      queries: queries

  nextId: 1
  disconnect: ->
    if @mutationSummary
      @mutationSummary.disconnect()
      @mutationSummary = `undefined`

  rememberNode: (node) ->
    id = @nextId++
    @knownNodes.set node, id
    id

  forgetNode: (node) ->
    delete @knownNodes.delete(node)

  serializeNode: (node, recursive) ->
    return null  if node is null
    id = @knownNodes.get(node)
    return id  if id isnt `undefined`
    data =
      nodeType: node.nodeType
      id: @rememberNode(node)

    switch data.nodeType
      when Node.DOCUMENT_TYPE_NODE
        data.name = node.name
        data.publicId = node.publicId
        data.systemId = node.systemId
      when Node.COMMENT_NODE, Node.TEXT_NODE
        data.textContent = node.textContent
      when Node.ELEMENT_NODE
        data.tagName = node.tagName
        data.attributes = {}
        i = 0

        while i < node.attributes.length
          attr = node.attributes.item(i)
          data.attributes[attr.name] = attr.value
          i++
        if recursive and node.childNodes.length
          data.childNodes = []
          child = node.firstChild

          while child
            data.childNodes.push @serializeNode(child, true)
            child = child.nextSibling
    data

  serializeAddedAndMoved: (changed) ->
    all = changed.added.concat(changed.reparented).concat(changed.reordered)
    parentMap = new MutationSummary.NodeMap
    all.forEach (node) ->
      parent = node.parentNode
      children = parentMap.get(parent)
      unless children
        children = new MutationSummary.NodeMap
        parentMap.set parent, children
      children.set node, true

    moved = []
    parentMap.keys().forEach ((parent) ->
      children = parentMap.get(parent)
      keys = children.keys()
      while keys.length
        node = keys[0]
        node = node.previousSibling  while node.previousSibling and children.has(node.previousSibling)
        while node and children.has(node)
          moved.push
            node: @serializeNode(node)
            previousSibling: @serializeNode(node.previousSibling)
            parentNode: @serializeNode(node.parentNode)

          children.delete node
          node = node.nextSibling
        keys = children.keys()
    ), this
    moved

  serializeAttributeChanges: (attributeChanged) ->
    map = new MutationSummary.NodeMap
    Object.keys(attributeChanged).forEach ((attrName) ->
      attributeChanged[attrName].forEach ((element) ->
        record = map.get(element)
        unless record
          record =
            node: @serializeNode(element)
            attributes: {}

          map.set element, record
        record.attributes[attrName] = element.getAttribute(attrName)
      ), this
    ), this
    map.keys().map (element) ->
      map.get element


  serializeCharacterDataChange: (node) ->
    node: @serializeNode(node)
    textContent: node.textContent

  applyChanged: (summaries) ->
    changed = summaries[0]
    removed = changed.removed.map(@serializeNode, this)
    moved = @serializeAddedAndMoved(changed)
    attributes = @serializeAttributeChanges(changed.attributeChanged)
    text = changed.characterDataChanged.map(@serializeCharacterDataChange, this)
    @mirror.applyChanged removed, moved, attributes, text
    changed.removed.forEach @forgetNode, this