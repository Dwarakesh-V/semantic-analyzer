import json
import os
from tree import struct_tree 

SECOND_PERSON_MENTIONS = ["you", "your", "yours", "yourself", "y'all", "y'all's", "y'all'self", "you're", "your'e""u", "ur", "urs", "urself"]

def tree_from_json(filepath):
    """
    Load a tree from a structured JSON file.
    Root node name is taken from the filename (without extension).
    Each node must have: intent, examples, response, and optionally children.
    """
    with open(filepath, 'r') as f:
        data = json.load(f)

    filename_intent = os.path.splitext(os.path.basename(filepath))[0]
    root_value = (filename_intent, ["Everything"], data["response"])
    tree = struct_tree(root_value)

    def add_children(parent_node, children_data):
        for child in children_data:
            # Validation
            if not all(k in child for k in ("intent", "label", "examples", "response")):
                raise ValueError(f"Missing required fields in node: {child}")
            
            intent = child["intent"]
            label = child["label"]

            examples = child["examples"]
            # Replace second-person mentions with "Amber AI" to match context
            # for i in range(len(examples)):
            #     for spm in SECOND_PERSON_MENTIONS:
            #         examples[i] = examples[i].replace(spm, "Amber AI")

            response = child["response"]

            value = (intent, label, examples, response)
            new_node = tree.add_node(parent_node, value)

            if "children" in child:
                add_children(new_node, child["children"])

    if "children" in data:
        add_children(tree.root, data["children"])
    
    return tree
