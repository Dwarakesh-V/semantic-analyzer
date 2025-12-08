from random import randint
def select_random_from_list(l):
    if isinstance(l, list): 
        return l[randint(0,len(l)-1)]
    else:
        return l