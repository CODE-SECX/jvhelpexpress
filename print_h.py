import os

def print_directory_structure(start_path='.', indent=''):
    for item in sorted(os.listdir(start_path)):
        # Skip hidden files/directories like .git
        if item.startswith('.'):
            continue

        item_path = os.path.join(start_path, item)
        if os.path.isdir(item_path):
            print(f"{indent}[{item}/]")
            print_directory_structure(item_path, indent + '    ')
        else:
            print(f"{indent}{item}")

if __name__ == "__main__":
    print("Directory structure starting from current directory (ignoring .git):\n")
    print_directory_structure()
