import random

with open('dummy_plaintext') as f:
    lines = f.readlines()
    counter = 0
    target = 0

    if (counter == 0):
        curNum = random.randint(10,15)

    for i in range(0, len(lines)):
        if (target == curNum):
            counter = counter + 1
            target = 0
        #content = lines[i].decode('utf-8').replace("\n", "")
        content = lines[i].replace("\n", "")

        print content + "|" + str(counter)
        target = target + 1