import multiprocessing as mp
from concurrent.futures import ProcessPoolExecutor
if __name__ == '__main__':
    with ProcessPoolExecutor(max_workers=1, mp_context=mp.get_context('spawn')) as pool:
        print(pool.submit(pow, 2, 5).result())
