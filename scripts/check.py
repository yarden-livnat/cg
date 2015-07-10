__author__ = 'yarden'

import os
files = set()

for f in os.listdir('/Users/yarden/data/cg/may-2015/other'):


for f in os.listdir('/Users/yarden/data/cg/may-2015/positive'):
    if f[2:] in files:
        print 'duplicate', f
    else:
        files.add(f[2:])

for f in os.listdir('/Users/yarden/data/cg/may-2015/negative'):
    if f[2:] in files:
        print 'duplicate', f
    else:
        files.add(f[2:])