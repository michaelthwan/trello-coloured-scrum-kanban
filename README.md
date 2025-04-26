# trello-coloured-scrum-kanban

https://greasyfork.org/en/scripts/37171-trello-coloured-scrum-kanban

Reference Kanban game's color for Trello list.

1. When a Trello list with name contains:
"Analysis" - red
"Development" - blue
"Testing" - green
"Ready to Deploy" - grey
"Deployed" - black

2. Simple colored card, changing card color when card name contains:
"!" - Primary goal of this iteration
"!!" - Secondary goal of this iteration
"`" - Low business impact
"[VIP]" - Express/Super urgent
"[P]" / "[Parent]" - parent card
"[R]" repeated card
Label contains "Blocked" - Blocked card

3. Auto count actual WIP
- WIP limit = 2. People with WIP = 0 or WIP > 2 will be highlighted.
- Member list on UI = People with avatar and People assigned in any cards on board
- Actual WIP per member = Assigned card in "In Progress" list, excluding cards with "Blocked"/"Keep monitoring"/"Pending for Desk Check" label.

4. Auto count list insight: card number, story point number, missing estimation number within list

5. Show card id. Red card id implies no story point estimation

![image](https://github.com/user-attachments/assets/482e7ca6-f4cd-4dff-b4d3-e30f7e02e05c)

![image](https://github.com/user-attachments/assets/8b3d55bd-22ab-4cbf-bc53-c31ba3e46e2a)

