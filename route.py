import ast
import sys
import socket
import select



def isfloat(value):
  try:
    float(value)
    return True
  except ValueError:
    return False

def send():
    for l in link:
        pkt = str({"addr":localaddr, "weight":link[l][0], "DVtable": DV})
        s1.sendto(pkt,l)
        # print(pkt)

def link_update(d):
    #update link
    #input weight = infi
    entry = link.get(d["addr"])
    if d['weight'] == infi:
        del link[d["addr"]]
        del counter2[d["addr"]]
    else:
        DVreceived = {}
        for x in d['DVtable']:
            DVreceived.update({x['destination']: x['cost']})
        link.update({d["addr"]:(d["weight"], DVreceived)})
        counter2.update({d['addr']:300})
    if entry != link.get(d["addr"]):return True
    else:return False

def computeDV():
    ## if link change:
    dest = set(link.keys())
    for t in link.values():dest.update(t[1].keys())
    dest.discard(localaddr)
    for key in list(localDV):
        if key not in dest: del localDV[key]
    for key in dest:
        values = []
        for addr in link:
            ## DVtable of this neighbor = link[addr][1]
            if key not in link[addr][1]: values.append(link[addr][0]+infi)
            else:values.append(link[addr][1][key] + link[addr][0])
        value = min(values)
        via = link.keys()[values.index(value)]
        localDV.update({key:(value,via)})
        for entry in list(localDV):
            if localDV[entry][0] >= infi:del localDV[entry]
        # if entry goes to infi then del
    global DV
    newDV = [{"destination":localaddr, "cost":0}]
    for key in localDV:
        newDV.append({"destination":key, "cost": localDV[key][0]})
    if newDV != DV:
        DV = newDV
        return True
    else: return False
    # if sendDV != sentDV, then send sentDV = sendDV

try:
    localport = int(sys.argv[1])
    timeout = int(sys.argv[2])
except:
    print "Port number and timeout should be digit numbers!"
    sys.exit()
## global link, localDV
localaddr = (socket.gethostbyname(socket.getfqdn()), localport)
link = {}
counter2={}

if len(sys.argv[3:])%3 != 0:
    print "neighbor must be triples"
    sys.exit()
for i in range(0,len(sys.argv[3:]),3):
    test = sys.argv[i+3].split('.')
    if len(test)>4 :
        print "addr input error"
        sys.exit()
    for a in test:
        if not (a.isdigit() and 0<=int(a)<256):
            print "addr input error"
            sys.exit()
    if not (sys.argv[i+4].isdigit() and isfloat(sys.argv[i+5])):
        print "addr input error"
        sys.exit()
    remoteaddr = (sys.argv[i+3], int(sys.argv[i+4]))
    weight = float(sys.argv[i+5])
    link.update({remoteaddr: (weight, {remoteaddr:0})})
    counter2.update({remoteaddr:300})

localDV = {}
DV = {}
infi = 99

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s1 = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

try:
    s.bind(localaddr)
except:
    print('port is already in use')
    sys.exit()



clock = timeout/100.0
counter1 = 100
DVchange = True
downlink = {}
sys.stdout.write("\rCommand:")
sys.stdout.flush()
try:
    while 1:
        re = select.select([sys.stdin,s], [], [],clock)[0]
        if re:
            for fd in re:
                if fd == s:
                    d=ast.literal_eval(s.recv(1024))
                    if d['addr'] not in downlink:
                        if link_update(d):
                            if computeDV(): DVchange=True
                else:
                    #input,send command as required.
                    command = raw_input().split(' ', 3)
                    cmd = command[0]
                    if len(command)>2 and command[2].isdigit(): addr = (command[1], int(command[2]))
                    else: addr = None
                    if len(command)>3 and isfloat(command[3]):newcost = float(command[3])
                    else: newcost = None
                    if cmd == "SHOWRT":
                        for line in localDV:
                            Destination = str(line[0])+':'+str(line[1])
                            Cost = str(localDV[line][0])
                            Link = str(localDV[line][1])
                            sys.stdout.write( "Destination = "+Destination+", Cost = " + Cost + ", Link = "+ Link + "\n" )
                        sys.stdout.flush()

                    elif cmd == "LINKDOWN" and addr in link:
                        # save the link to block and restore list, a dict {addr,weight}
                        downlink.update({addr:link[addr][0]})
                        if link_update({"addr":addr, "weight":infi , "DVtable":[]}):
                            if computeDV(): DVchange=True
                        # make a linkupdate message.{addr = (remote),weight = infi,DVtable:{}},update local link,instantaneous.stop send. t1
                        # make a linkupdate message.{addr = (local),weight = infi,DVtable:{}},update remote.
                        pkt = str({"addr":localaddr, "weight":infi, "DVtable":[]})
                        s1.sendto(pkt,addr)
                    elif cmd == "LINKUP" and addr in downlink:
                        # update local,add it to local link
                        if link_update({"addr":addr,"weight":downlink[addr],"DVtable":[{"destination":addr,"cost":0}]}):
                            if computeDV(): DVchange=True
                        del downlink[addr]

                    elif cmd == "CLOSE":
                        print "process closed by user"
                        sys.exit()

                    elif cmd == "UPDATE" and addr in link and newcost:
                        link.update({addr: (newcost, {addr:0})})
                        if computeDV(): DVchange=True

                    elif cmd == "NEWLINK" and addr and addr not in link and addr not in downlink and newcost:
                        link.update({addr: (newcost, {addr:0})})
                        counter2.update({addr:300})
                        if computeDV(): DVchange=True

                    else:
                        sys.stdout.write("Wrong command,please try again\n")

                    sys.stdout.write("\rCommand:")
                    sys.stdout.flush()
        #counter--
        counter1 = counter1 - 1
        for addr in counter2:
            counter2[addr] = counter2[addr] -1

        #timeout*1 or DV change, send, clear timeout*1
        if DVchange or counter1==0:
            send()
            DVchange = False
            counter1 = 100

        #timeout*3 close link,update local link clear it from local variable
        for addr in list(counter2):
            if counter2[addr] == 0:
                if link_update({"addr":addr,"weight":infi,"DVtable":{}}):
                    if computeDV(): DVchange=True
except KeyboardInterrupt:
    print("Exiting.....Thank you for using.")