import json


def intify(i):
      # Python's int data type by default stores an unbounded amount of data, so we trim it to a signed 32-bit integer, which is used in Java's hashCode function
  return (i % 4294967296) - 2147483648

def getId(s):
  counter = 0
  for i in range(len(s)):
    counter += intify(ord(s[-i-1]) * (pow(31,i)))
    # The iterative algorithm that computes the hash in Java
  return abs(intify(counter))
        
# Opening JSON file
f = open("../src/json/services.json")
 
# returns JSON object as
# a dictionary
data = json.load(f)
i=3
urls=[]
categories=["Advertising", "Content", "Analytics", "FingerprintingInvasive", "FingerprintingGeneral", "Social", "Cryptomining", "Disconnect"]
networks=data["categories"]
for cat in categories:
    for nets in networks[cat]:
        for n in nets.values():
            for url in n.values():
                for u in url:
                    urls.append(u)

    rules=[]
    for url in urls:
        i+=1
        rules.append(
        {
            "id": i,
            "priority": 3,
            "action": {
                "type": "modifyHeaders",
                "requestHeaders": [
                    { "header": "Sec-GPC", "operation": "set", "value": "1" },
                    { "header": "DNT", "operation": "set", "value": "1" }
                ]
            },
            "condition": {
                "urlFilter": "*"+url+"*",
                "resourceTypes": [
                    "main_frame",
                    "sub_frame",
                    "stylesheet",
                    "script",
                    "image",
                    "font",
                    "object",
                    "xmlhttprequest",
                    "ping",
                    "csp_report",
                    "media",
                    "websocket",
                    "webtransport",
                    "webbundle"
                ]
            }
        })
    

    jsonString = json.dumps(rules)
    jsonFile = open("../src/rulesets/"+cat+".json", "w")
    jsonFile.write(jsonString)
    jsonFile.close()
    
        
        
 
# Closing file
f.close()