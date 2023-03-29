
class WorkFlow:
    def __init__(self, id = "id"):
        self.nodes = {}
        self.id = id
        self.origin = {}

class WorkFlowNode:
    def __init__(self):
        self.postConditions = []
        self.id = "id"
        self.preConditions = []
        self.data = {}
        self.isExternal = False
