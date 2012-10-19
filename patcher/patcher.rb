require 'json'
require 'hpricot'

include Hpricot

module DOMLike

  def appendChild(node)
    self.children ||= []
    self.children << node
    node.parent = self
  end

  def removeChild(node)
    node.parent = nil
    self.children.delete node
  end

  def insertBefore(node, before)
    self.children ||= []
    if not before then
      self.children << node
      node.parent = self
      return
    end
    i = children.index before
    children.insert i, node
    node.parent = self
  end

  def firstChild()
    return if not self.children
    self.children.first
  end

  def nextSibling()
    i = self.parent.children.index self
    self.parent.children[i+1]
  end

  def removeAttribute(name)
    self.raw_attributes.delete name
  end

  def setAttribute(name, value)
    self.raw_attributes ||= {}
    self.raw_attributes[name] = value
  end

end

# emulate DOM on top of Hpricot
[Elem, Text, Comment, Doc].each do |klass|
  klass.class_eval do
    include DOMLike
  end
end

# rewrite of http://code.google.com/p/mutation-summary/source/browse/tree_mirror.js
class TreeMirror

  def initialize(doc, payload)
    @doc = doc
    @payload = payload
    @map = {}
    @payload["init"].each_with_index do |xpath, id|
      next if xpath.nil?
      @map[id] = @doc.at(xpath) # TODO: report missing elements
    end
  end

  def patch!
    @payload["changesets"].each do |changeset|
      applyChanged(*changeset)
    end
  end

  def deserializeNode(nodeData, parent=nil)
    return if nodeData.nil?
    return @map[nodeData] if nodeData.is_a? Integer

    node = nil
    case nodeData["nodeType"]
    when 8 # COMMENT_NODE
      node = Comment.new nodeData["textContent"]
    when 3 # TEXT NODE
      node =  Text.new nodeData["textContent"]
    when 10 # DOCUMENT_TYPE_NODE
      node = Doc.new # TODO: DOCUMENT_TYPE_NODE
    when 1 # ELEMENT_NODE
      node = Elem.new nodeData["tagName"].downcase
      if nodeData["attributes"] then
        nodeData["attributes"].each do |key, value|
          node.setAttribute key, value
        end
      end
    end

    @map[nodeData["id"]] = node

    parent.appendChild node unless parent.nil?

    if (nodeData["childNodes"]) then
      nodeData["childNodes"].each do |childData|
        deserializeNode(childData, node)
      end
    end
    node
  end

  def removeNode(node)
    return if node.parent.nil?
    node.parent.removeChild(node)
  end

  def moveOrInsertNode(data)
    parent = data["parentNode"]
    previous = data["previousSibling"]
    node = data["node"]
    parent.insertBefore(node, previous ? previous.nextSibling() : parent.firstChild())
  end

  def updateAttributes(data)
    node = deserializeNode(data["node"])
    data["attributes"].each do |key, value|
      if value.nil? then
        node.removeAttribute key
      else
        node.setAttribute key, value
      end
    end
  end

  def updateText(data)
    node = deserializeNode(data["node"])
    node.content = data["textContent"]
  end

  def applyChanged(removed, addedOrMoved, attributes, text)
    addedOrMoved.each do |data|
      data["node"] = deserializeNode(data["node"])
      data["previousSibling"] = deserializeNode(data["previousSibling"])
      data["parentNode"] = deserializeNode(data["parentNode"])

      # NOTE: Applying the changes can result in an attempting to add a child
      # to a parent which is presently an ancestor of the parent. This can occur
      # based on random ordering of moves. The way we handle this is to first
      # remove all changed nodes from their parents, then apply.
      removeNode(data["node"]) if data["node"]
    end
    removed.each do |id|
      node = deserializeNode id
      removeNode node
    end
    addedOrMoved.each do |nodeData|
      moveOrInsertNode nodeData
    end
    attributes.each do |attrData|
      updateAttributes attrData
    end
    text.each do |textData|
      updateText textData
    end
    removed.each do |id|
      @map.delete id
    end
  end

end

def patch(file, options)
  file_contents = File.read file
  payload_contents = File.read options.payload
  payload = JSON.parse payload_contents

  orig_std_out = STDOUT.clone
  STDOUT.reopen(File.open(options.output, 'w+')) if options.output

  doc = Hpricot file_contents

  mirror = TreeMirror.new(doc, payload)
  mirror.patch!

  print doc.to_s
  STDOUT.reopen orig_std_out
end