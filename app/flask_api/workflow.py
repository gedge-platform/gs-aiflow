
class WorkFlow:
    def __init__(self, id = "id"):
        self.nodes = {}
        self.id = id
        self.origin = {}

class WorkFlowNode:
    def __init__(self):
        self.id = "id"
        self.preConditions = []
        self.data = {}
